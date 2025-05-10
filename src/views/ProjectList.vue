<template>
  <div class="project-list-container">
    <el-card class="page-header">
      <div class="header-content">
        <h1>项目进度管理系统</h1>
        <div class="action-buttons">
          <el-button type="primary" size="default" @click="showAddProjectDialog">
            <el-icon><Plus /></el-icon> 添加新项目
          </el-button>
          <el-button size="default" @click="exportProjectData">
            <el-icon><Download /></el-icon> 导出数据
          </el-button>
          <el-button size="default" @click="importFileRef.click()">
            <el-icon><Upload /></el-icon> 导入数据
          </el-button>
          <input
            type="file"
            ref="importFileRef"
            style="display: none"
            accept=".json"
            @change="importProjectData"
          />
        </div>
      </div>
    </el-card>

    <div class="project-grid">
      <el-card
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="viewProjectDetail(project)"
      >
        <div class="project-content">
          <div class="project-header">
            <h2>{{ project.name }}</h2>
            <el-tag :type="getStatusType(project.status)" size="small">{{ project.status }}</el-tag>
          </div>
          <div class="project-progress">
            <span class="progress-label">总体进度: {{ project.progress }}%</span>
            <el-progress
              :percentage="project.progress"
              :status="getProgressStatus(project.progress)"
            ></el-progress>
          </div>
          <div class="project-info">
            <div class="info-grid">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>开始日期: {{ formatDate(project.startDate) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>截止日期: {{ formatDate(project.endDate) }}</span>
              </div>
              <div class="info-item">
                <el-icon><List /></el-icon>
                <span>任务数: {{ project.tasks ? project.tasks.length : 0 }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>负责人: {{ project.manager || '未指定' }}</span>
              </div>
              <div class="info-item members-item" v-if="project.members && project.members.length > 0">
                <el-icon><UserFilled /></el-icon>
                <span class="members-text">成员: {{ project.members.join(', ') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="delete-button-container">
          <el-button 
            type="danger" 
            size="small" 
            circle
            @click.stop="confirmDeleteProject(project)"
            class="delete-button"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 添加项目对话框 -->
    <el-dialog v-model="addProjectDialogVisible" title="添加新项目" width="500px">
      <el-form :model="newProject" label-width="100px">
        <el-form-item label="项目名称" required>
          <el-input v-model="newProject.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            type="textarea"
            v-model="newProject.description"
            rows="3"
            placeholder="请输入项目描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="newProject.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="截止日期" required>
          <el-date-picker
            v-model="newProject.endDate"
            type="date"
            placeholder="选择截止日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select v-model="newProject.status" placeholder="选择项目状态">
            <el-option label="未开始" value="未开始"></el-option>
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已延期" value="已延期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人">
          <el-input v-model="newProject.manager" placeholder="请输入项目负责人"></el-input>
        </el-form-item>
        <el-form-item label="项目参与人">
          <el-tag
            v-for="(member, index) in newProject.members"
            :key="index"
            closable
            @close="removeMember(index)"
            class="member-tag"
          >
            {{ member }}
          </el-tag>
          <el-input
            v-if="inputMemberVisible"
            ref="memberInputRef"
            v-model="inputMemberValue"
            class="member-input"
            size="small"
            @keyup.enter="addMember"
            @blur="addMember"
          />
          <el-button v-else class="button-new-member" size="small" @click="showMemberInput">
            + 添加成员
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="default" @click="addProjectDialogVisible = false">取消</el-button>
          <el-button type="primary" size="default" @click="addProject">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, List, User, UserFilled, Plus, Download, Upload, Delete } from '@element-plus/icons-vue';
import { getProjects, createProject, deleteProject } from '../services/api';

export default {
  name: 'ProjectList',
  components: {
    Calendar,
    List,
    User,
    UserFilled,
    Plus,
    Download,
    Upload,
    Delete
  },
  setup() {
    const router = useRouter();
    const importFileRef = ref(null);
    const memberInputRef = ref(null);

    // 项目数据
    const projects = ref([]);

    // 添加项目对话框
    const addProjectDialogVisible = ref(false);
    const newProject = reactive({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: '未开始',
      progress: 0,
      manager: '',
      members: [],
      tasks: []
    });
    
    // 项目参与人输入
    const inputMemberVisible = ref(false);
    const inputMemberValue = ref('');
    
    // 显示成员输入框
    const showMemberInput = () => {
      inputMemberVisible.value = true;
      // 等待DOM更新后聚焦
      setTimeout(() => {
        memberInputRef.value.focus();
      });
    };
    
    // 添加成员
    const addMember = () => {
      if (inputMemberValue.value) {
        if (!newProject.members.includes(inputMemberValue.value)) {
          newProject.members.push(inputMemberValue.value);
        }
        inputMemberValue.value = '';
      }
      inputMemberVisible.value = false;
    };
    
    // 移除成员
    const removeMember = (index) => {
      newProject.members.splice(index, 1);
    };

    // 加载项目数据
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        projects.value = data || [];
      } catch (error) {
        ElMessage.error('加载项目数据失败');
        console.error(error);
      }
    };

    // 显示添加项目对话框
    const showAddProjectDialog = () => {
      // 重置表单
      Object.assign(newProject, {
        name: '',
        description: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 10),
        status: '未开始',
        progress: 0,
        manager: '',
        members: [],
        tasks: []
      });
      addProjectDialogVisible.value = true;
    };

    // 添加项目
    const addProject = async () => {
      if (!newProject.name) {
        ElMessage.warning('请输入项目名称');
        return;
      }
      if (!newProject.startDate || !newProject.endDate) {
        ElMessage.warning('请选择开始和截止日期');
        return;
      }

      // 创建新项目
      const project = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        status: newProject.status,
        progress: newProject.progress,
        manager: newProject.manager,
        members: [...newProject.members],
        tasks: []
      };

      try {
        // 使用API创建项目
        await createProject(project);
        
        // 重新加载项目列表
        await loadProjects();
        
        // 关闭对话框
        addProjectDialogVisible.value = false;
        
        ElMessage.success('项目添加成功');
      } catch (error) {
        console.error('添加项目失败:', error);
        ElMessage.error('添加项目失败');
      }
    };

    // 查看项目详情
    const viewProjectDetail = (project) => {
      router.push(`/project/${project.id}`);
    };

    // 删除项目
    const confirmDeleteProject = (project) => {
      ElMessageBox.confirm(`确认删除项目 "${project.name}" 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await deleteProject(project.id);
            await loadProjects();
            ElMessage.success('项目删除成功');
          } catch (error) {
            console.error('删除项目失败:', error);
            ElMessage.error('删除项目失败');
          }
        })
        .catch(() => {
          // 取消删除
        });
    };

    // 导出项目数据
    const exportProjectData = () => {
      if (!projects.value || projects.value.length === 0) {
        ElMessage.warning('没有可导出的项目数据');
        return;
      }

      // 创建JSON数据
      const jsonData = JSON.stringify(projects.value, null, 2);

      // 创建下载链接
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 创建下载元素
      const link = document.createElement('a');
      link.href = url;
      link.download = `项目进度数据_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      ElMessage.success('项目数据导出成功');
    };

    // 导入项目数据
    const importProjectData = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (Array.isArray(importedData) && importedData.length > 0) {
            // 确认是否替换现有数据
            ElMessageBox.confirm(
              '导入的数据将替换当前所有项目数据，是否继续？',
              '警告',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }
            )
              .then(async () => {
                try {
                  // 对每个项目使用API创建
                  for (const project of importedData) {
                    await createProject(project);
                  }
                  
                  // 重新加载项目列表
                  await loadProjects();
                  
                  ElMessage.success('项目数据导入成功');
                } catch (error) {
                  console.error('导入数据错误:', error);
                  ElMessage.error('导入数据失败');
                }
              })
              .catch(() => {
                // 取消导入
              });
          } else {
            ElMessage.error('无效的项目数据格式');
          }
        } catch (error) {
          console.error('导入数据错误:', error);
          ElMessage.error('导入数据失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
      // 重置文件输入，以便可以重新选择同一个文件
      event.target.value = '';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // 获取状态类型
    const getStatusType = (status) => {
      switch (status) {
        case '未开始':
          return 'info';
        case '进行中':
          return 'primary';
        case '已完成':
          return 'success';
        case '已延期':
          return 'danger';
        default:
          return '';
      }
    };

    // 获取进度状态
    const getProgressStatus = (progress) => {
      if (progress === 100) return 'success';
      if (progress >= 80) return 'success';
      if (progress >= 50) return '';
      return 'exception';
    };

    // 初始化
    onMounted(() => {
      // 从服务器加载项目数据
      loadProjects();
    });

    return {
      projects,
      addProjectDialogVisible,
      newProject,
      importFileRef,
      memberInputRef,
      inputMemberVisible,
      inputMemberValue,
      showMemberInput,
      addMember,
      removeMember,
      showAddProjectDialog,
      addProject,
      viewProjectDetail,
      confirmDeleteProject,
      exportProjectData,
      importProjectData,
      formatDate,
      getStatusType,
      getProgressStatus
    };
  }
};
</script>

<style scoped>
.project-list-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  min-height: 380px;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.project-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
}

.project-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.project-progress {
  margin-bottom: 20px;
}

.progress-label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.project-info {
  margin-bottom: 15px;
  flex-grow: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 5px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  padding: 5px 0;
}

.info-item .el-icon {
  margin-right: 8px;
  margin-top: 3px;
  color: #909399;
  font-size: 16px;
}

.members-item {
  grid-column: 1 / 3;
  margin-top: 10px;
  border-top: 1px dashed #EBEEF5;
  padding-top: 10px;
}

.members-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  color: #606266;
}

.delete-button-container {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover .delete-button-container {
  opacity: 1;
}

.delete-button {
  padding: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
