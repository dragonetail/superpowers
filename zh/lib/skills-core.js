import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * 从技能文件中提取 YAML 前置数据。
 * 当前格式：
 * ---
 * name: skill-name
 * description: Use when [condition] - [what it does]
 * ---
 *
 * @param {string} filePath - SKILL.md 文件路径
 * @returns {{name: string, description: string}}
 */
function extractFrontmatter(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let inFrontmatter = false;
        let name = '';
        let description = '';

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) break;
                inFrontmatter = true;
                continue;
            }

            if (inFrontmatter) {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    switch (key) {
                        case 'name':
                            name = value.trim();
                            break;
                        case 'description':
                            description = value.trim();
                            break;
                    }
                }
            }
        }

        return { name, description };
    } catch (error) {
        return { name: '', description: '' };
    }
}

/**
 * 递归查找目录中的所有 SKILL.md 文件。
 *
 * @param {string} dir - 要搜索的目录
 * @param {string} sourceType - 'personal' 或 'superpowers'，用于命名空间
 * @param {number} maxDepth - 最大递归深度（默认：3）
 * @returns {Array<{path: string, name: string, description: string, sourceType: string}>}
 */
function findSkillsInDir(dir, sourceType, maxDepth = 3) {
    const skills = [];

    if (!fs.existsSync(dir)) return skills;

    function recurse(currentDir, depth) {
        if (depth > maxDepth) return;

        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // 检查此目录中是否有 SKILL.md
                const skillFile = path.join(fullPath, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    const { name, description } = extractFrontmatter(skillFile);
                    skills.push({
                        path: fullPath,
                        skillFile: skillFile,
                        name: name || entry.name,
                        description: description || '',
                        sourceType: sourceType
                    });
                }

                // 递归进入子目录
                recurse(fullPath, depth + 1);
            }
        }
    }

    recurse(dir, 0);
    return skills;
}

/**
 * 解析技能名称到其文件路径，处理遮蔽规则
 * （个人技能覆盖 superpowers 技能）。
 *
 * @param {string} skillName - 技能名称，如 "superpowers:brainstorming" 或 "my-skill"
 * @param {string} superpowersDir - superpowers 技能目录路径
 * @param {string} personalDir - 个人技能目录路径
 * @returns {{skillFile: string, sourceType: string, skillPath: string} | null}
 */
function resolveSkillPath(skillName, superpowersDir, personalDir) {
    // 如果存在 superpowers: 前缀则去除
    const forceSuperpowers = skillName.startsWith('superpowers:');
    const actualSkillName = forceSuperpowers ? skillName.replace(/^superpowers:/, '') : skillName;

    // 首先尝试个人技能（除非明确指定 superpowers:）
    if (!forceSuperpowers && personalDir) {
        const personalPath = path.join(personalDir, actualSkillName);
        const personalSkillFile = path.join(personalPath, 'SKILL.md');
        if (fs.existsSync(personalSkillFile)) {
            return {
                skillFile: personalSkillFile,
                sourceType: 'personal',
                skillPath: actualSkillName
            };
        }
    }

    // 尝试 superpowers 技能
    if (superpowersDir) {
        const superpowersPath = path.join(superpowersDir, actualSkillName);
        const superpowersSkillFile = path.join(superpowersPath, 'SKILL.md');
        if (fs.existsSync(superpowersSkillFile)) {
            return {
                skillFile: superpowersSkillFile,
                sourceType: 'superpowers',
                skillPath: actualSkillName
            };
        }
    }

    return null;
}

/**
 * 检查 git 仓库是否有可用更新。
 *
 * @param {string} repoDir - git 仓库路径
 * @returns {boolean} - 如果有可用更新则返回 true
 */
function checkForUpdates(repoDir) {
    try {
        // 使用 3 秒超时快速检查，以避免网络故障时的延迟
        const output = execSync('git fetch origin && git status --porcelain=v1 --branch', {
            cwd: repoDir,
            timeout: 3000,
            encoding: 'utf8',
            stdio: 'pipe'
        });

        // 解析 git status 输出以查看是否落后
        const statusLines = output.split('\n');
        for (const line of statusLines) {
            if (line.startsWith('## ') && line.includes('[behind ')) {
                return true; // 我们落后于远程
            }
        }
        return false; // 已是最新
    } catch (error) {
        // 网络故障、git 错误、超时等 - 不阻止启动
        return false;
    }
}

/**
 * 从技能内容中去除 YAML 前置数据，仅返回内容部分。
 *
 * @param {string} content - 包含前置数据的完整内容
 * @returns {string} - 不含前置数据的内容
 */
function stripFrontmatter(content) {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterEnded = false;
    const contentLines = [];

    for (const line of lines) {
        if (line.trim() === '---') {
            if (inFrontmatter) {
                frontmatterEnded = true;
                continue;
            }
            inFrontmatter = true;
            continue;
        }

        if (frontmatterEnded || !inFrontmatter) {
            contentLines.push(line);
        }
    }

    return contentLines.join('\n').trim();
}

export {
    extractFrontmatter,
    findSkillsInDir,
    resolveSkillPath,
    checkForUpdates,
    stripFrontmatter
};
