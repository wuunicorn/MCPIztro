#!/usr/bin/env node
/**
 * MCP服务器功能测试脚本
 * 用于测试紫微斗数MCP服务器的JSON-RPC接口
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 测试MCP服务器
 */
async function testMCPServer() {
    console.log('=== MCP服务器功能测试 ===\n');

    return new Promise((resolve, reject) => {
        // 启动MCP服务器
        const serverProcess = spawn('node', [join(__dirname, 'ziwei_mcp_server.js')], {
            stdio: ['pipe', 'pipe', 'inherit']
        });

        let responseCount = 0;
        const expectedResponses = 4; // initialize + tools/list + get_current_time + calculate_ziwei

        // 监听服务器响应
        serverProcess.stdout.on('data', (data) => {
            const lines = data.toString().trim().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const response = JSON.parse(line.trim());
                        console.log('收到响应:', JSON.stringify(response, null, 2));
                        responseCount++;

                        if (responseCount >= expectedResponses) {
                            serverProcess.kill();
                            resolve();
                        }
                    } catch (error) {
                        console.error('解析响应失败:', error.message);
                        console.error('原始数据:', line);
                    }
                }
            }
        });

        serverProcess.on('close', (code) => {
            console.log(`\nMCP服务器退出，退出码: ${code}`);
            if (code === 0) {
                console.log('✓ MCP服务器测试完成');
            } else {
                console.log('✗ MCP服务器异常退出');
            }
        });

        serverProcess.on('error', (error) => {
            console.error('启动MCP服务器失败:', error);
            reject(error);
        });

        // 发送测试请求
        setTimeout(() => {
            // 1. 初始化请求
            console.log('发送初始化请求...');
            serverProcess.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {}
            }) + '\n');

            setTimeout(() => {
                // 2. 获取工具列表
                console.log('发送获取工具列表请求...');
                serverProcess.stdin.write(JSON.stringify({
                    jsonrpc: "2.0",
                    id: 2,
                    method: "tools/list",
                    params: {}
                }) + '\n');

                setTimeout(() => {
                    // 3. 测试获取当前时间
                    console.log('发送获取当前时间请求...');
                    serverProcess.stdin.write(JSON.stringify({
                        jsonrpc: "2.0",
                        id: 3,
                        method: "tools/call",
                        params: {
                            name: "get_current_time",
                            arguments: {}
                        }
                    }) + '\n');

                    setTimeout(() => {
                        // 4. 测试计算紫微斗数
                        console.log('发送计算紫微斗数请求...');
                        serverProcess.stdin.write(JSON.stringify({
                            jsonrpc: "2.0",
                            id: 4,
                            method: "tools/call",
                            params: {
                                name: "calculate_ziwei",
                                arguments: {
                                    birthday: "2000-08-16",
                                    hour: 2,
                                    gender: "女",
                                    language: "zh-CN"
                                }
                            }
                        }) + '\n');
                    }, 500);
                }, 500);
            }, 500);
        }, 1000);
    });
}

/**
 * 测试运限功能
 */
async function testHoroscope() {
    console.log('\n=== 运限功能测试 ===\n');

    return new Promise((resolve, reject) => {
        const serverProcess = spawn('node', [join(__dirname, 'ziwei_mcp_server.js')], {
            stdio: ['pipe', 'pipe', 'inherit']
        });

        serverProcess.stdout.on('data', (data) => {
            const lines = data.toString().trim().split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const response = JSON.parse(line.trim());
                        console.log('运限响应:', JSON.stringify(response, null, 2));
                        serverProcess.kill();
                        resolve();
                    } catch (error) {
                        console.error('解析响应失败:', error.message);
                    }
                }
            }
        });

        serverProcess.on('close', (code) => {
            console.log(`运限测试服务器退出，退出码: ${code}`);
        });

        setTimeout(() => {
            console.log('发送运限计算请求...');
            serverProcess.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/call",
                params: {
                    name: "get_horoscope",
                    arguments: {
                        birthday: "2000-08-16",
                        hour: 2,
                        gender: "女",
                        targetDate: "2024-12-31",
                        language: "zh-CN"
                    }
                }
            }) + '\n');
        }, 1000);
    });
}

// 运行所有测试
async function runAllTests() {
    try {
        await testMCPServer();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
        await testHoroscope();
        console.log('\n✓ 所有MCP功能测试完成！');
    } catch (error) {
        console.error('测试失败:', error);
        process.exit(1);
    }
}

runAllTests();
