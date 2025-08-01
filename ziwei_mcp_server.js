#!/usr/bin/env node
/**
 * 紫微斗数 MCP 服务器
 * 基于 iztro 库实现紫微斗数排盘功能
 */

import { astro } from 'iztro';
import { createInterface } from 'readline';
import process from 'process';

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
 */
function calculateZiwei(birthday, hour = 0, gender = '男', type = 'solar', isLeapMonth = false, language = 'zh-CN') {
    try {
        let astrolabe;
        
        if (type === 'solar') {
            // 阳历
            astrolabe = astro.bySolar(birthday, hour, gender, true, language);
        } else {
            // 农历
            astrolabe = astro.byLunar(birthday, hour, gender, isLeapMonth, true, language);
        }
        
        if (!astrolabe) {
            throw new Error('无法生成星盘数据');
        }
        
        // 构建详细的返回数据
        const result = {
            birthday: birthday,
            hour: hour,
            gender: gender,
            type: type,
            isLeapMonth: isLeapMonth,
            language: language,
            
            // 基本信息
            solarDate: astrolabe.solarDate,
            lunarDate: astrolabe.lunarDate,
            chineseDate: astrolabe.chineseDate,
            time: astrolabe.time,
            timeRange: astrolabe.timeRange,
            sign: astrolabe.sign,
            zodiac: astrolabe.zodiac,
            earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
            earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
            soul: astrolabe.soul,
            body: astrolabe.body,
            fiveElementsClass: astrolabe.fiveElementsClass,
            
            // 十二宫数据
            palaces: astrolabe.palaces.map(palace => ({
                name: palace.name,
                isBodyPalace: palace.isBodyPalace,
                isOriginalPalace: palace.isOriginalPalace,
                heavenlyStem: palace.heavenlyStem,
                earthlyBranch: palace.earthlyBranch,
                majorStars: palace.majorStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                minorStars: palace.minorStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                adjectiveStars: palace.adjectiveStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                changeLimitStars: palace.changeLimitStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                }))
            }))
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
 */
function getHoroscope(birthday, hour = 0, gender = '男', type = 'solar', isLeapMonth = false, targetDate = null, language = 'zh-CN') {
    try {
        let astrolabe;
        
        if (type === 'solar') {
            astrolabe = astro.bySolar(birthday, hour, gender, true, language);
        } else {
            astrolabe = astro.byLunar(birthday, hour, gender, isLeapMonth, true, language);
        }
        
        if (!astrolabe) {
            throw new Error('无法生成星盘数据');
        }
        
        // 如果没有指定目标日期，使用当前日期
        const target = targetDate ? new Date(targetDate) : new Date();
        const horoscope = astrolabe.horoscope(target);
        
        const result = {
            birthday: birthday,
            hour: hour,
            gender: gender,
            type: type,
            isLeapMonth: isLeapMonth,
            targetDate: target.toISOString().slice(0, 10),
            language: language,
            
            // 运限信息
            solarDate: horoscope.solarDate,
            lunarDate: horoscope.lunarDate,
            chineseDate: horoscope.chineseDate,
            decadal: horoscope.decadal,
            age: horoscope.age,
            yearIndex: horoscope.yearIndex,
            
            // 十二宫运限数据
            palaces: horoscope.palaces.map(palace => ({
                name: palace.name,
                isBodyPalace: palace.isBodyPalace,
                isOriginalPalace: palace.isOriginalPalace,
                heavenlyStem: palace.heavenlyStem,
                earthlyBranch: palace.earthlyBranch,
                majorStars: palace.majorStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                minorStars: palace.minorStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                adjectiveStars: palace.adjectiveStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                })),
                changeLimitStars: palace.changeLimitStars.map(star => ({
                    name: star.name,
                    type: star.type,
                    scope: star.scope,
                    brightness: star.brightness,
                    mutagen: star.mutagen
                }))
            }))
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
                                    description: "计算指定生辰的紫微斗数星盘，返回完整的星盘数据（包含十二宫、星耀、亮度等）",
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
                                            }
                                        },
                                        required: ["birthday"]
                                    }
                                },
                                {
                                    name: "get_horoscope",
                                    description: "获取指定生辰在特定时间的运限信息（大限、流年等）",
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
                                        arguments_.language || 'zh-CN'
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
                                        arguments_.language || 'zh-CN'
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