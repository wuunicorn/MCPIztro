#!/usr/bin/env node
/**
 * 紫微斗数 MCP 服务器
 * 基于 iztro 库实现紫微斗数排盘功能
 */

import { astro } from 'iztro';
import { createInterface } from 'readline';
import process from 'process';

/**
 * 将24小时制转换为12时辰序号
 * @param {number} hour - 24小时制时间（0-23）
 * @returns {number} 12时辰序号（0-11）
 *
 * 时辰对照表：
 * 子时(0): 23-1点   丑时(1): 1-3点    寅时(2): 3-5点    卯时(3): 5-7点
 * 辰时(4): 7-9点    巳时(5): 9-11点   午时(6): 11-13点  未时(7): 13-15点
 * 申时(8): 15-17点  酉时(9): 17-19点  戌时(10): 19-21点 亥时(11): 21-23点
 */
function hourToTimeIndex(hour) {
    // 确保hour在0-23范围内
    hour = Math.max(0, Math.min(23, Math.floor(hour)));

    // 时辰划分：每个时辰2小时，但子时跨越了23-1点
    if (hour === 23 || hour === 0) {
        return 0; // 子时
    } else {
        // 其他时辰：1-3点为丑时(1)，3-5点为寅时(2)，依此类推
        return Math.floor((hour + 1) / 2);
    }
}

/**
 * 将时钟时间转换为真太阳时
 * @param {number} hour - 原始小时（0-23）
 * @param {number} minute - 原始分钟（0-59）
 * @param {number} longitude - 经度（-180 到 180）
 * @param {string} dateStr - 日期字符串（YYYY-MM-DD）
 * @returns {Object} 转换后的时间 {hour: number, minute: number}
 */
function convertToTrueSolarTime(hour, minute, longitude, dateStr) {
    try {
        // 解析日期
        const date = new Date(dateStr + 'T00:00:00');
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // 计算儒略日
        const a = Math.floor((14 - month) / 12);
        const y = year + 4800 - a;
        const m = month + 12 * a - 3;
        const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

        // 计算从J2000.0开始的儒略世纪数
        const n = (julianDay - 2451545.0) / 36525;

        // 计算太阳的几何平均黄经（度）
        let L = (280.46646 + n * (36000.76983 + n * 0.0003032)) % 360;

        // 计算太阳的平近点角（度）
        let g = (357.52911 + n * (35999.05029 - n * 0.0001537)) % 360;

        // 计算日地距离的地球轨道偏心率
        const ecc = 0.016708634 - n * (0.000042037 + n * 0.0000001267);

        // 计算太阳的方程时（分钟）
        const equationOfTime = 4 * (L - 0.0057183 - g + ecc * Math.sin(g * Math.PI / 180) * (1.914602 - n * (0.004817 + n * 0.000014)) +
            (0.019993 - n * 0.000101) * Math.sin(2 * g * Math.PI / 180) + 0.000289 * Math.sin(3 * g * Math.PI / 180));

        // 计算经度修正（每15度经度对应1小时 = 60分钟）
        const longitudeCorrection = longitude * 4; // 每经度4分钟

        // 计算真太阳时（分钟）
        const clockTimeMinutes = hour * 60 + minute;
        let trueSolarTimeMinutes = clockTimeMinutes + equationOfTime - longitudeCorrection;

        // 规范化到0-1440分钟范围内
        trueSolarTimeMinutes = ((trueSolarTimeMinutes % 1440) + 1440) % 1440;

        // 转换回小时和分钟
        const trueHour = Math.floor(trueSolarTimeMinutes / 60);
        const trueMinute = Math.floor(trueSolarTimeMinutes % 60);

        return { hour: trueHour, minute: trueMinute };
    } catch (error) {
        // 如果计算失败，返回原始时间
        console.warn('真太阳时转换失败，使用原始时间:', error.message);
        return { hour: hour, minute: minute };
    }
}

/**
 * 获取当前时间并返回格式化结果
 */
function getCurrentTime() {
    try {
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        
        const result = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds(),
            datetime_str: now.toISOString().slice(0, 19).replace('T', ' '),
            weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
            weekday_cn: weekdays[now.getDay()],
            timestamp: Math.floor(now.getTime() / 1000)
        };
        
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 计算紫微斗数星盘
 * @param {string} birthday - 生日，格式：YYYY-MM-DD
 * @param {number} hour - 出生时辰（0-23）
 * @param {string} gender - 性别：'男' 或 '女'
 * @param {string} type - 日期类型：'solar'(阳历) 或 'lunar'(农历)
 * @param {boolean} isLeapMonth - 是否闰月（仅农历有效）
 * @param {string} language - 语言：'zh-CN', 'zh-TW', 'en-US' 等
 * @param {number} longitude - 经度（-180 到 180）
 * @param {number} latitude - 纬度（-90 到 90）
 */
function calculateZiwei(birthday, hour = 0, gender = '男', type = 'solar', isLeapMonth = false, language = 'zh-CN', longitude = 116.4074, latitude = 39.9042) {
    try {
        // 如果提供了经纬度，进行真太阳时转换
        let actualHour = hour;
        if (longitude !== undefined && latitude !== undefined) {
            const trueSolarTime = convertToTrueSolarTime(hour, 0, longitude, birthday);
            actualHour = trueSolarTime.hour;
        }

        // 将24小时制转换为12时辰序号
        const timeIndex = hourToTimeIndex(actualHour);
        let astrolabe;

        if (type === 'solar') {
            // 阳历
            astrolabe = astro.bySolar(birthday, timeIndex, gender, true, language);
        } else {
            // 农历
            astrolabe = astro.byLunar(birthday, timeIndex, gender, isLeapMonth, true, language);
        }

        if (!astrolabe) {
            throw new Error('无法生成星盘数据');
        }

        // 直接返回astrolabe对象，添加请求参数信息
        const result = {
            ...astrolabe,
            requestParams: {
                birthday: birthday,
                originalHour: hour,
                actualHour: actualHour,
                timeIndex: timeIndex,
                gender: gender,
                type: type,
                isLeapMonth: isLeapMonth,
                language: language,
                longitude: longitude,
                latitude: latitude,
                trueSolarTimeUsed: (longitude !== undefined && latitude !== undefined)
            }
        };

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 获取运限信息
 * @param {string} birthday - 生日，格式：YYYY-MM-DD
 * @param {number} hour - 出生时辰（0-23）
 * @param {string} gender - 性别：'男' 或 '女'
 * @param {string} type - 日期类型：'solar'(阳历) 或 'lunar'(农历)
 * @param {boolean} isLeapMonth - 是否闰月（仅农历有效）
 * @param {string} targetDate - 目标日期，格式：YYYY-MM-DD
 * @param {string} language - 语言：'zh-CN', 'zh-TW', 'en-US' 等
 * @param {number} longitude - 经度（-180 到 180）
 * @param {number} latitude - 纬度（-90 到 90）
 */
function getHoroscope(birthday, hour = 0, gender = '男', type = 'solar', isLeapMonth = false, targetDate = null, language = 'zh-CN', longitude = 116.4074, latitude = 39.9042) {
    try {
        // 如果提供了经纬度，进行真太阳时转换
        let actualHour = hour;
        if (longitude !== undefined && latitude !== undefined) {
            const trueSolarTime = convertToTrueSolarTime(hour, 0, longitude, birthday);
            actualHour = trueSolarTime.hour;
        }

        // 将24小时制转换为12时辰序号
        const timeIndex = hourToTimeIndex(actualHour);
        let astrolabe;

        if (type === 'solar') {
            astrolabe = astro.bySolar(birthday, timeIndex, gender, true, language);
        } else {
            astrolabe = astro.byLunar(birthday, timeIndex, gender, isLeapMonth, true, language);
        }

        if (!astrolabe) {
            throw new Error('无法生成星盘数据');
        }

        // 如果没有指定目标日期，使用当前日期
        const target = targetDate ? new Date(targetDate) : new Date();
        const horoscope = astrolabe.horoscope(target);

        // 直接返回horoscope对象，添加请求参数信息
        const result = {
            ...horoscope,
            requestParams: {
                birthday: birthday,
                originalHour: hour,
                actualHour: actualHour,
                timeIndex: timeIndex,
                gender: gender,
                type: type,
                isLeapMonth: isLeapMonth,
                targetDate: target.toISOString().slice(0, 10),
                language: language,
                longitude: longitude,
                latitude: latitude,
                trueSolarTimeUsed: (longitude !== undefined && latitude !== undefined)
            }
        };

        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * 主函数 - 处理 MCP 请求
 */
function main() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    rl.on('line', (line) => {
        try {
            const request = JSON.parse(line.trim());
            const method = request.method;
            const params = request.params || {};
            let response;

            switch (method) {
                case 'initialize':
                    // 初始化响应
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: {
                            protocolVersion: "2024-11-05",
                            capabilities: { tools: {} },
                            serverInfo: {
                                name: "ziwei-mcp-server",
                                version: "1.0.0",
                                description: "紫微斗数计算服务器 - 基于 iztro 库"
                            }
                        }
                    };
                    break;

                case 'tools/list':
                    // 返回可用工具列表
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        result: {
                            tools: [
                                {
                                    name: "get_current_time",
                                    description: "获取当前系统时间，返回详细的时间信息",
                                    inputSchema: {
                                        type: "object",
                                        properties: {},
                                        required: []
                                    }
                                },
                                {
                                    name: "calculate_ziwei",
                                    description: "计算指定生辰的紫微斗数星盘，返回完整的星盘数据（包含十二宫、星耀、亮度等）。支持经纬度参数，将时间转换为真太阳时进行更精确的计算",
                                    inputSchema: {
                                        type: "object",
                                        properties: {
                                            birthday: {
                                                type: "string",
                                                description: "生日，格式: YYYY-MM-DD",
                                                examples: ["2000-08-16", "1990-12-25", "1985-06-15"]
                                            },
                                            hour: {
                                                type: "integer",
                                                description: "出生时辰（0-23）",
                                                minimum: 0,
                                                maximum: 23,
                                                default: 0
                                            },
                                            gender: {
                                                type: "string",
                                                description: "性别",
                                                enum: ["男", "女"],
                                                default: "男"
                                            },
                                            type: {
                                                type: "string",
                                                description: "日期类型",
                                                enum: ["solar", "lunar"],
                                                default: "solar"
                                            },
                                            isLeapMonth: {
                                                type: "boolean",
                                                description: "是否闰月（仅农历有效）",
                                                default: false
                                            },
                                            language: {
                                                type: "string",
                                                description: "语言设置",
                                                enum: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "vi-VN"],
                                                default: "zh-CN"
                                            },
                                            longitude: {
                                                type: "number",
                                                description: "出生地经度（-180 到 180），用于真太阳时转换",
                                                minimum: -180,
                                                maximum: 180,
                                                default: 116.4074,
                                                examples: [116.4074, -74.0060, 139.6917]
                                            },
                                            latitude: {
                                                type: "number",
                                                description: "出生地纬度（-90 到 90），用于真太阳时转换",
                                                minimum: -90,
                                                maximum: 90,
                                                default: 39.9042,
                                                examples: [39.9042, 40.7128, 35.6762]
                                            }
                                        },
                                        required: ["birthday"]
                                    }
                                },
                                {
                                    name: "get_horoscope",
                                    description: "获取指定生辰在特定时间的运限信息（大限、流年等）。支持经纬度参数，将时间转换为真太阳时进行更精确的计算",
                                    inputSchema: {
                                        type: "object",
                                        properties: {
                                            birthday: {
                                                type: "string",
                                                description: "生日，格式: YYYY-MM-DD",
                                                examples: ["2000-08-16", "1990-12-25", "1985-06-15"]
                                            },
                                            hour: {
                                                type: "integer",
                                                description: "出生时辰（0-23）",
                                                minimum: 0,
                                                maximum: 23,
                                                default: 0
                                            },
                                            gender: {
                                                type: "string",
                                                description: "性别",
                                                enum: ["男", "女"],
                                                default: "男"
                                            },
                                            type: {
                                                type: "string",
                                                description: "日期类型",
                                                enum: ["solar", "lunar"],
                                                default: "solar"
                                            },
                                            isLeapMonth: {
                                                type: "boolean",
                                                description: "是否闰月（仅农历有效）",
                                                default: false
                                            },
                                            targetDate: {
                                                type: "string",
                                                description: "目标日期，格式: YYYY-MM-DD，不指定则使用当前日期",
                                                examples: ["2024-12-31", "2025-06-15"]
                                            },
                                            language: {
                                                type: "string",
                                                description: "语言设置",
                                                enum: ["zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "vi-VN"],
                                                default: "zh-CN"
                                            },
                                            longitude: {
                                                type: "number",
                                                description: "出生地经度（-180 到 180），用于真太阳时转换",
                                                minimum: -180,
                                                maximum: 180,
                                                default: 116.4074,
                                                examples: [116.4074, -74.0060, 139.6917]
                                            },
                                            latitude: {
                                                type: "number",
                                                description: "出生地纬度（-90 到 90），用于真太阳时转换",
                                                minimum: -90,
                                                maximum: 90,
                                                default: 39.9042,
                                                examples: [39.9042, 40.7128, 35.6762]
                                            }
                                        },
                                        required: ["birthday"]
                                    }
                                }
                            ]
                        }
                    };
                    break;

                case 'tools/call':
                    // 处理工具调用
                    const toolName = params.name;
                    const arguments_ = params.arguments || {};

                    switch (toolName) {
                        case 'get_current_time':
                            try {
                                const result = getCurrentTime();
                                response = {
                                    jsonrpc: "2.0",
                                    id: request.id,
                                    result: {
                                        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                                        isError: false
                                    }
                                };
                            } catch (error) {
                                response = {
                                    jsonrpc: "2.0",
                                    id: request.id,
                                    result: {
                                        content: [{ type: "text", text: `获取时间错误: ${error.message}` }],
                                        isError: true
                                    }
                                };
                            }
                            break;

                        case 'calculate_ziwei':
                            const birthday = arguments_.birthday;
                            if (birthday) {
                                try {
                                    const result = calculateZiwei(
                                        birthday,
                                        arguments_.hour || 0,
                                        arguments_.gender || '男',
                                        arguments_.type || 'solar',
                                        arguments_.isLeapMonth || false,
                                        arguments_.language || 'zh-CN',
                                        arguments_.longitude,
                                        arguments_.latitude
                                    );
                                    response = {
                                        jsonrpc: "2.0",
                                        id: request.id,
                                        result: {
                                            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                                            isError: false
                                        }
                                    };
                                } catch (error) {
                                    response = {
                                        jsonrpc: "2.0",
                                        id: request.id,
                                        result: {
                                            content: [{ type: "text", text: `计算错误: ${error.message}` }],
                                            isError: true
                                        }
                                    };
                                }
                            } else {
                                response = {
                                    jsonrpc: "2.0",
                                    id: request.id,
                                    result: {
                                        content: [{ type: "text", text: "错误: 需要提供 birthday 参数" }],
                                        isError: true
                                    }
                                };
                            }
                            break;

                        case 'get_horoscope':
                            const hBirthday = arguments_.birthday;
                            if (hBirthday) {
                                try {
                                    const result = getHoroscope(
                                        hBirthday,
                                        arguments_.hour || 0,
                                        arguments_.gender || '男',
                                        arguments_.type || 'solar',
                                        arguments_.isLeapMonth || false,
                                        arguments_.targetDate || null,
                                        arguments_.language || 'zh-CN',
                                        arguments_.longitude,
                                        arguments_.latitude
                                    );
                                    response = {
                                        jsonrpc: "2.0",
                                        id: request.id,
                                        result: {
                                            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                                            isError: false
                                        }
                                    };
                                } catch (error) {
                                    response = {
                                        jsonrpc: "2.0",
                                        id: request.id,
                                        result: {
                                            content: [{ type: "text", text: `运限计算错误: ${error.message}` }],
                                            isError: true
                                        }
                                    };
                                }
                            } else {
                                response = {
                                    jsonrpc: "2.0",
                                    id: request.id,
                                    result: {
                                        content: [{ type: "text", text: "错误: 需要提供 birthday 参数" }],
                                        isError: true
                                    }
                                };
                            }
                            break;

                        default:
                            response = {
                                jsonrpc: "2.0",
                                id: request.id,
                                result: {
                                    content: [{ type: "text", text: `未知工具: ${toolName}` }],
                                    isError: true
                                }
                            };
                            break;
                    }
                    break;

                default:
                    response = {
                        jsonrpc: "2.0",
                        id: request.id,
                        error: { code: -32601, message: "Method not found" }
                    };
                    break;
            }

            // 输出响应
            console.log(JSON.stringify(response));
        } catch (error) {
            if (error instanceof SyntaxError) {
                console.log(JSON.stringify({
                    jsonrpc: "2.0",
                    id: null,
                    error: { code: -32700, message: "Parse error" }
                }));
            } else {
                console.log(JSON.stringify({
                    jsonrpc: "2.0",
                    id: null,
                    error: { code: -32603, message: `Internal error: ${error.message}` }
                }));
            }
        }
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

// 如果直接运行此文件，启动服务器
import { fileURLToPath } from 'url';
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    main();
}