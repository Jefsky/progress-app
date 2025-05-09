# 清除 db.json 历史记录指南

由于 db.json 文件已经被提交到 Git 仓库，即使我们现在已经将其从仓库中删除，但历史记录中仍然包含该文件的内容。如果其中包含敏感数据，我们需要彻底清除这些历史记录。

## 方法一：使用 BFG Repo-Cleaner（推荐）

BFG 是一个专门用于清理 Git 仓库历史的工具，比 git-filter-branch 更快、更简单。

### 步骤：

1. 下载 BFG Jar 文件：
   - 访问 https://rtyley.github.io/bfg-repo-cleaner/
   - 下载最新版本的 BFG Jar 文件

2. 创建仓库的镜像克隆：
   ```bash
   git clone --mirror https://github.com/Jefsky/progress-app.git progress-app-mirror
   cd progress-app-mirror
   ```

3. 运行 BFG 命令删除 db.json 文件的历史：
   ```bash
   java -jar path/to/bfg.jar --delete-files db.json
   ```

4. 清理和更新引用：
   ```bash
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

5. 推送更改到 GitHub：
   ```bash
   git push
   ```

6. 返回到原始仓库并拉取更改：
   ```bash
   cd ../progress-app
   git pull
   ```

## 方法二：使用 git-filter-branch

如果无法使用 BFG，可以使用 git 内置的 filter-branch 命令。

### 步骤：

1. 运行以下命令删除 db.json 文件的历史：
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch db.json" --prune-empty --tag-name-filter cat -- --all
   ```

2. 清理和更新引用：
   ```bash
   git for-each-ref --format="delete %(refname)" refs/original/ | git update-ref --stdin
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. 强制推送更改到 GitHub：
   ```bash
   git push origin --force --all
   ```

## 注意事项

- 这些操作会重写 Git 历史，所有团队成员需要重新克隆仓库或进行特殊的合并操作
- 如果仓库已经被多人克隆，需要通知所有人进行相应的操作
- 这些操作无法撤销，请确保在操作前备份仓库

## 预防措施

为了避免类似问题再次发生，请确保：

1. 在项目初始阶段就添加 .gitignore 文件
2. 定期检查 Git 状态，确保没有敏感文件被意外提交
3. 考虑使用 git hooks 来防止敏感文件被提交
