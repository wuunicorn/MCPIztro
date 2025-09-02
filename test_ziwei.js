#!/usr/bin/env node
/**
 * 紫微斗数功能测试文件
 * 用于测试 iztro 库的基本功能
 */

import { astro } from 'iztro';

/**
 * 测试阳历排盘
 */
function testSolarAstrolabe() {
    console.log('=== 测试阳历排盘 ===');
    try {
        // 2000年8月16日2时出生的女性
        const astrolabe = astro.bySolar('2000-8-16', 2, '女', true, 'zh-CN');
        
        console.log('生日：', astrolabe.solarDate);
        console.log('农历：', astrolabe.lunarDate);
        console.log('中文日期：', astrolabe.chineseDate);
        console.log('时辰：', astrolabe.time);
        console.log('星座：', astrolabe.sign);
        console.log('生肖：', astrolabe.zodiac);
        console.log('命主：', astrolabe.soul);
        console.log('身主：', astrolabe.body);
        console.log('五行局：', astrolabe.fiveElementsClass);
        
        console.log('\n十二宫信息：');
        astrolabe.palaces.forEach((palace, index) => {
            console.log(`${palace.name}宫 (${palace.heavenlyStem}${palace.earthlyBranch}):`);
            console.log(`  主星: ${palace.majorStars.map(s => s.name + (s.brightness ? `(${s.brightness})` : '')).join(', ')}`);
            if (palace.minorStars.length > 0) {
                console.log(`  辅星: ${palace.minorStars.map(s => s.name).join(', ')}`);
            }
            if (palace.adjectiveStars.length > 0) {
                console.log(`  杂耀: ${palace.adjectiveStars.map(s => s.name).join(', ')}`);
            }
        });
        
        console.log('\n✓ 阳历排盘测试成功\n');
        return true;
    } catch (error) {
        console.error('✗ 阳历排盘测试失败:', error.message);
        return false;
    }
}

/**
 * 测试农历排盘
 */
function testLunarAstrolabe() {
    console.log('=== 测试农历排盘 ===');
    try {
        // 农历2000年七月十七日2时出生的女性
        const astrolabe = astro.byLunar('2000-7-17', 2, '女', false, true, 'zh-CN');
        
        console.log('阳历：', astrolabe.solarDate);
        console.log('农历：', astrolabe.lunarDate);
        console.log('中文日期：', astrolabe.chineseDate);
        console.log('时辰：', astrolabe.time);
        console.log('星座：', astrolabe.sign);
        console.log('生肖：', astrolabe.zodiac);
        console.log('命主：', astrolabe.soul);
        console.log('身主：', astrolabe.body);
        console.log('五行局：', astrolabe.fiveElementsClass);
        
        console.log('\n✓ 农历排盘测试成功\n');
        return true;
    } catch (error) {
        console.error('✗ 农历排盘测试失败:', error.message);
        return false;
    }
}

/**
 * 测试运限功能
 */
function testHoroscope() {
    console.log('=== 测试运限功能 ===');
    try {
        const astrolabe = astro.bySolar('2000-8-16', 2, '女', true, 'zh-CN');
        const horoscope = astrolabe.horoscope(new Date('2024-12-31'));
        
        console.log('目标日期：', horoscope.solarDate);
        console.log('农历：', horoscope.lunarDate);
        console.log('中文日期：', horoscope.chineseDate);
        console.log('年龄：', horoscope.age);
        console.log('大限：', horoscope.decadal.name);
        console.log('流年：', horoscope.yearly?.name || '无');
        
        console.log('\n✓ 运限功能测试成功\n');
        return true;
    } catch (error) {
        console.error('✗ 运限功能测试失败:', error.message);
        return false;
    }
}

/**
 * 测试宫位检索功能
 */
function testPalaceFunctions() {
    console.log('=== 测试宫位检索功能 ===');
    try {
        const astrolabe = astro.bySolar('2000-8-16', 2, '女', true, 'zh-CN');
        
        // 获取命宫
        const palace = astrolabe.palace('命宫');
        console.log('命宫信息：', palace.name, palace.heavenlyStem + palace.earthlyBranch);
        
        // 检查命宫是否有紫微星
        const hasZiwei = palace.majorStars.some(star => star.name === '紫微');
        console.log('命宫是否有紫微星：', hasZiwei);

        // 获取紫微星所在宫位 - 遍历所有宫位查找紫微星
        let ziweiPalace = null;
        for (const p of astrolabe.palaces) {
            if (p.majorStars.some(star => star.name === '紫微')) {
                ziweiPalace = p;
                break;
            }
        }
        console.log('紫微星在：', ziweiPalace?.name || '无');
        
        console.log('\n✓ 宫位检索功能测试成功\n');
        return true;
    } catch (error) {
        console.error('✗ 宫位检索功能测试失败:', error.message);
        return false;
    }
}

/**
 * 测试多语言功能
 */
function testMultiLanguage() {
    console.log('=== 测试多语言功能 ===');
    try {
        const languages = ['zh-CN', 'zh-TW', 'en-US'];
        
        languages.forEach(lang => {
            const astrolabe = astro.bySolar('2000-8-16', 2, '女', true, lang);
            console.log(`${lang}: 命宫 = ${astrolabe.palace('命宫').name}`);
        });
        
        console.log('\n✓ 多语言功能测试成功\n');
        return true;
    } catch (error) {
        console.error('✗ 多语言功能测试失败:', error.message);
        return false;
    }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    console.log('开始测试紫微斗数功能...\n');
    
    const tests = [
        testSolarAstrolabe,
        testLunarAstrolabe,
        testHoroscope,
        testPalaceFunctions,
        testMultiLanguage
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        if (test()) {
            passedTests++;
        }
    }
    
    console.log('='.repeat(50));
    console.log(`测试完成: ${passedTests}/${tests.length} 通过`);
    
    if (passedTests === tests.length) {
        console.log('✓ 所有测试通过，紫微斗数功能正常！');
        process.exit(0);
    } else {
        console.log('✗ 部分测试失败，请检查配置');
        process.exit(1);
    }
}

// 运行测试
runAllTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
});