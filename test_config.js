#!/usr/bin/env node
/**
 * 测试MCP配置的简单脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 测试直接node运行
 */
function testDirectNode() {
    console.log('🧪 测试直接node运行...');
    return new Promise((resolve) => {
        const process = spawn('/opt/homebrew/bin/node', [join(__dirname, 'ziwei_mcp_server.js')], {
            stdio: ['pipe', 'pipe', 'inherit']
        });

        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        // 发送初始化请求
        setTimeout(() => {
            process.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {}
            }) + '\n');
        }, 100);

        // 等待响应
        setTimeout(() => {
            process.kill();
            if (output.includes('protocolVersion')) {
                console.log('✅ 直接node运行成功');
            } else {
                console.log('❌ 直接node运行失败');
            }
            resolve();
        }, 500);
    });
}

/**
 * 测试npm运行
 */
function testNpmRun() {
    console.log('🧪 测试npm运行...');
    return new Promise((resolve) => {
        const npmProcess = spawn('npm', ['run', 'start'], {
            cwd: __dirname,
            stdio: ['pipe', 'pipe', 'inherit'],
            env: { ...globalThis.process.env, PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin' }
        });

        let output = '';
        npmProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        // 发送初始化请求
        setTimeout(() => {
            npmProcess.stdin.write(JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "initialize",
                params: {}
            }) + '\n');
        }, 100);

        // 等待响应
        setTimeout(() => {
            npmProcess.kill();
            if (output.includes('protocolVersion')) {
                console.log('✅ npm运行成功');
            } else {
                console.log('❌ npm运行失败');
            }
            resolve();
        }, 1000);
    });
}

// 运行测试
async function runTests() {
    console.log('🚀 开始测试MCP配置...\n');

    await testDirectNode();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testNpmRun();

    console.log('\n📋 配置总结:');
    console.log('✅ 主配置 (ziwei): 使用完整node路径');
    console.log('✅ 备用配置 (ziwei_npm): 使用npm运行');
    console.log('\n💡 建议: 如果主配置仍有问题，请尝试备用配置');
}

runTests().catch(console.error);
