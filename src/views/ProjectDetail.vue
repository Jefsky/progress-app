<template>
  <div class="project-detail-container">
    <!-- 项目头部信息 -->
    <el-card class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button @click="goBack" icon="ArrowLeft">返回项目列表</el-button>
          <h1>{{ project?.name || '项目详情' }}</h1>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="showAddTaskDialog">添加任务</el-button>
          <el-button type="warning" @click="showEditProjectDialog">编辑项目</el-button>
        </div>
      </div>
      <div class="project-info">
        <p><strong>开始日期:</strong> {{ formatDate(project?.startDate) }}</p>
        <p><strong>截止日期:</strong> {{ formatDate(project?.endDate) }}</p>
        <p><strong>项目描述:</strong> {{ project?.description }}</p>
        <p><strong>项目负责人:</strong> {{ project?.manager || '未指定' }}</p>
        <p>
          <strong>项目参与人:</strong>
          <el-tag 
            v-for="(member, index) in project?.members" 
            :key="index"
            size="small"
            class="member-tag"
          >
            {{ member }}
          </el-tag>
          <span v-if="!project?.members || project.members.length === 0">暂无参与人</span>
        </p>
        <div class="progress-wrapper">
          <div class="progress-header">
            <strong>项目进度:</strong>
            <span class="progress-percentage" :class="getProgressColorClass(project?.progress || 0)">
              {{ project?.progress || 0 }}%
            </span>
          </div>
          <el-progress 
            :percentage="project?.progress || 0" 
            :status="getProgressStatus(project?.progress || 0)"
            :stroke-width="10"
            :show-text="false"
            class="custom-progress"
          ></el-progress>
          <div class="progress-info">
            <span class="progress-label" :class="getProgressLabelClass(project?.progress || 0)">
              {{ getProgressLabel(project?.progress || 0) }}
            </span>
            <span class="progress-date" v-if="project?.endDate">
              截止日期: {{ formatDate(project?.endDate) }}
            </span>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 项目进度图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <h2>任务进度图表</h2>
        </div>
      </template>
      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </el-card>
    
    <!-- 任务列表 -->
    <el-card class="task-list" v-if="project">
      <template #header>
        <div class="card-header">
          <h2>任务列表</h2>
          <div class="filter-controls">
            <el-select v-model="taskFilter" placeholder="筛选状态" class="filter-select">
              <el-option label="全部" value="all"></el-option>
              <el-option label="待办" value="待办"></el-option>
              <el-option label="进行中" value="进行中"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
            </el-select>
            <el-select v-model="taskSort" placeholder="排序方式" class="filter-select">
              <el-option label="默认排序" value="default"></el-option>
              <el-option label="优先级" value="priority"></el-option>
              <el-option label="截止日期" value="deadline"></el-option>
              <el-option label="完成度" value="progress"></el-option>
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredAndSortedTasks" style="width: 100%">
        <el-table-column label="任务名称" prop="name"></el-table-column>
        <el-table-column label="优先级" width="90">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100">
          <template #default="scope">
            <span v-if="scope.row.assignee">{{ scope.row.assignee }}</span>
            <span v-else class="text-muted">未指定</span>
          </template>
        </el-table-column>
        <el-table-column label="参与人员" width="150">
          <template #default="scope">
            <el-popover
              v-if="scope.row.participants && scope.row.participants.length > 0"
              placement="top"
              :width="200"
              trigger="hover"
            >
              <template #reference>
                <el-tag size="small" type="info">
                  {{ scope.row.participants.length }} 人参与
                </el-tag>
              </template>
              <div>
                <div v-for="(member, index) in scope.row.participants" :key="index" class="participant-item">
                  {{ member }}
                </div>
              </div>
            </el-popover>
            <span v-else class="text-muted">无</span>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="scope">
            <div class="task-progress-wrapper">
              <el-progress 
                :percentage="scope.row.progress" 
                :status="getProgressStatus(scope.row.progress)"
                :stroke-width="6"
                :show-text="false"
                class="task-progress"
              ></el-progress>
              <span class="task-progress-text" :class="getProgressColorClass(scope.row.progress)">
                {{ scope.row.progress }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="100">
          <template #default="scope">
            {{ formatDate(scope.row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="editTask(scope.row)"
              type="primary" 
              circle
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              size="small" 
              @click="deleteTask(scope.row)"
              type="danger" 
              circle
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  
  <!-- 添加任务对话框 -->
  <el-dialog v-model="addTaskDialogVisible" title="添加新任务" width="500px">
    <el-form :model="newTask" label-width="100px">
      <el-form-item label="任务名称" required>
        <el-input v-model="newTask.name" placeholder="请输入任务名称"></el-input>
      </el-form-item>
      <el-form-item label="任务描述">
        <el-input 
          v-model="newTask.description" 
          type="textarea" 
          placeholder="请输入任务描述"
          rows="3"
        ></el-input>
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker 
          v-model="newTask.deadline" 
          type="date" 
          placeholder="选择截止日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="newTask.priority" placeholder="请选择优先级">
          <el-option 
            v-for="item in priorityOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="newTask.status" placeholder="请选择状态">
          <el-option label="待办" value="待办"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="完成度">
        <el-slider v-model="newTask.progress" :step="5"></el-slider>
      </el-form-item>
      
      <el-form-item label="任务负责人">
        <el-select 
          v-model="newTask.assignee" 
          filterable 
          allow-create 
          default-first-option
          placeholder="请选择或输入任务负责人"
          style="width: 100%"
        >
          <el-option 
            v-for="member in project?.members" 
            :key="member" 
            :label="member" 
            :value="member"
          ></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="参与人员">
        <el-tag
          v-for="(member, index) in newTask.participants"
          :key="index"
          closable
          @close="removeTaskParticipant(index)"
          class="member-tag"
        >
          {{ member }}
        </el-tag>
        <el-input
          v-if="inputTaskParticipantVisible"
          ref="taskParticipantInputRef"
          v-model="inputTaskParticipantValue"
          class="member-input"
          size="small"
          @keyup.enter="addTaskParticipant"
          @blur="addTaskParticipant"
        />
        <el-button v-else class="button-new-member" size="small" @click="showTaskParticipantInput">
          + 添加参与人
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTask">添加</el-button>
      </span>
    </template>
  </el-dialog>
  
  <!-- 编辑任务对话框 -->
  <el-dialog v-model="editTaskDialogVisible" title="编辑任务" width="500px" v-if="editingTask">
    <el-form :model="editingTask" label-width="100px">
      <el-form-item label="任务名称" required>
        <el-input v-model="editingTask.name" placeholder="请输入任务名称"></el-input>
      </el-form-item>
      <el-form-item label="任务描述">
        <el-input 
          v-model="editingTask.description" 
          type="textarea" 
          placeholder="请输入任务描述"
          rows="3"
        ></el-input>
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker 
          v-model="editingTask.deadline" 
          type="date" 
          placeholder="选择截止日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="优先级">
        <el-select v-model="editingTask.priority" placeholder="请选择优先级">
          <el-option 
            v-for="item in priorityOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editingTask.status" placeholder="请选择状态">
          <el-option label="待办" value="待办"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="完成度">
        <el-slider v-model="editingTask.progress" :step="5"></el-slider>
      </el-form-item>
      
      <el-form-item label="任务负责人">
        <el-select 
          v-model="editingTask.assignee" 
          filterable 
          allow-create 
          default-first-option
          placeholder="请选择或输入任务负责人"
          style="width: 100%"
        >
          <el-option 
            v-for="member in project?.members" 
            :key="member" 
            :label="member" 
            :value="member"
          ></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="参与人员">
        <el-tag
          v-for="(member, index) in editingTask.participants"
          :key="index"
          closable
          @close="removeEditTaskParticipant(index)"
          class="member-tag"
        >
          {{ member }}
        </el-tag>
        <el-input
          v-if="inputEditTaskParticipantVisible"
          ref="editTaskParticipantInputRef"
          v-model="inputEditTaskParticipantValue"
          class="member-input"
          size="small"
          @keyup.enter="addEditTaskParticipant"
          @blur="addEditTaskParticipant"
        />
        <el-button v-else class="button-new-member" size="small" @click="showEditTaskParticipantInput">
          + 添加参与人
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editTaskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateTask">保存</el-button>
      </span>
    </template>
  </el-dialog>
  
  <!-- 编辑项目对话框 -->
  <el-dialog v-model="editProjectDialogVisible" title="编辑项目" width="500px" v-if="editingProject">
    <el-form :model="editingProject" label-width="100px">
      <el-form-item label="项目名称" required>
        <el-input v-model="editingProject.name" placeholder="请输入项目名称"></el-input>
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input 
          v-model="editingProject.description" 
          type="textarea" 
          placeholder="请输入项目描述"
          rows="3"
        ></el-input>
      </el-form-item>
      <el-form-item label="项目负责人">
        <el-input v-model="editingProject.manager" placeholder="请输入项目负责人"></el-input>
      </el-form-item>
      <el-form-item label="项目参与人">
        <el-tag
          v-for="(member, index) in editingProject.members"
          :key="index"
          closable
          @close="removeProjectMember(index)"
          class="member-tag"
        >
          {{ member }}
        </el-tag>
        <el-input
          v-if="inputProjectMemberVisible"
          ref="projectMemberInputRef"
          v-model="inputProjectMemberValue"
          class="member-input"
          size="small"
          @keyup.enter="addProjectMember"
          @blur="addProjectMember"
        />
        <el-button v-else class="button-new-member" size="small" @click="showProjectMemberInput">
          + 添加成员
        </el-button>
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker 
          v-model="editingProject.startDate" 
          type="date" 
          placeholder="选择开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="截止日期">
        <el-date-picker 
          v-model="editingProject.endDate" 
          type="date" 
          placeholder="选择截止日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="项目状态">
        <el-select v-model="editingProject.status" placeholder="请选择项目状态">
          <el-option label="未开始" value="未开始"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
          <el-option label="已延期" value="已延期"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目进度">
        <el-slider v-model="editingProject.progress" :step="5" :max="100" show-input></el-slider>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editProjectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateProject">保存</el-button>
      </span>
    </template>
  </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import Chart from 'chart.js/auto';
import { getProject, updateProject as apiUpdateProject } from '../services/api';

export default {
  name: 'ProjectDetail',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const chartCanvas = ref(null);
    let chartInstance = null;
    const projectMemberInputRef = ref(null);
    const taskParticipantInputRef = ref(null);
    const editTaskParticipantInputRef = ref(null);

    // 项目数据
    const project = ref(null);
    const projectId = computed(() => route.params.id);
    
    // 项目参与人输入
    const inputProjectMemberVisible = ref(false);
    const inputProjectMemberValue = ref('');
    
    // 任务参与人输入
    const inputTaskParticipantVisible = ref(false);
    const inputTaskParticipantValue = ref('');
    
    // 编辑任务参与人输入
    const inputEditTaskParticipantVisible = ref(false);
    const inputEditTaskParticipantValue = ref('');

    // 任务筛选和排序
    const taskFilter = ref('all');
    const taskSort = ref('default');

    // 对话框状态
    const addTaskDialogVisible = ref(false);
    const editTaskDialogVisible = ref(false);
    const editProjectDialogVisible = ref(false);

    // 新任务表单
    const newTask = reactive({
      name: '',
      description: '',
      deadline: '',
      priority: '中',
      status: '待办',
      progress: 0,
      assignee: '',
      participants: []
    });

    // 编辑任务
    const editingTask = ref(null);

    // 编辑项目
    const editingProject = ref(null);

    // 优先级选项
    const priorityOptions = [
      { value: '低', label: '低' },
      { value: '中', label: '中' },
      { value: '高', label: '高' },
      { value: '紧急', label: '紧急' }
    ];

    // 项目数据保存函数
    const saveProject = async (projectData) => {
      try {
        await apiUpdateProject(projectData.id, projectData);
        return true;
      } catch (error) {
        console.error('保存项目失败:', error);
        ElMessage.error('保存项目失败');
        return false;
      }
    };

    // 筛选和排序后的任务
    const filteredAndSortedTasks = computed(() => {
      if (!project.value || !project.value.tasks) return [];
      
      // 先筛选
      let result = project.value.tasks;
      if (taskFilter.value !== 'all') {
        result = result.filter(task => task.status === taskFilter.value);
      }
      
      // 再排序
      if (taskSort.value === 'priority') {
        const priorityOrder = { '紧急': 0, '高': 1, '中': 2, '低': 3 };
        result = [...result].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      } else if (taskSort.value === 'deadline') {
        result = [...result].sort((a, b) => {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        });
      } else if (taskSort.value === 'progress') {
        result = [...result].sort((a, b) => b.progress - a.progress);
      }
      
      return result;
    });

    // 加载项目数据
    const loadProject = async () => {
      try {
        const data = await getProject(projectId.value);
        if (data) {
          project.value = data;
        } else {
          ElMessage.error('找不到该项目');
          router.push('/');
        }
      } catch (error) {
        console.error('加载项目失败:', error);
        ElMessage.error('加载项目失败');
        router.push('/');
      }
    };

    // 返回项目列表
    const goBack = () => {
      router.push('/');
    };

    // 显示添加任务对话框
    const showAddTaskDialog = () => {
      // 重置表单
      Object.assign(newTask, {
        name: '',
        description: '',
        deadline: '',
        priority: '中',
        status: '待办',
        progress: 0,
        assignee: '',
        participants: []
      });
      
      addTaskDialogVisible.value = true;
    };
    
    // 显示任务参与人输入框
    const showTaskParticipantInput = () => {
      inputTaskParticipantVisible.value = true;
      // 等待DOM更新后聚焦
      setTimeout(() => {
        taskParticipantInputRef.value.focus();
      });
    };
    
    // 添加任务参与人
    const addTaskParticipant = () => {
      if (inputTaskParticipantValue.value) {
        if (!newTask.participants.includes(inputTaskParticipantValue.value)) {
          newTask.participants.push(inputTaskParticipantValue.value);
        }
        inputTaskParticipantValue.value = '';
      }
      inputTaskParticipantVisible.value = false;
    };
    
    // 移除任务参与人
    const removeTaskParticipant = (index) => {
      newTask.participants.splice(index, 1);
    };
    
    // 显示编辑任务参与人输入框
    const showEditTaskParticipantInput = () => {
      inputEditTaskParticipantVisible.value = true;
      // 等待DOM更新后聚焦
      setTimeout(() => {
        editTaskParticipantInputRef.value.focus();
      });
    };
    
    // 添加编辑任务参与人
    const addEditTaskParticipant = () => {
      if (inputEditTaskParticipantValue.value) {
        if (!editingTask.value.participants) {
          editingTask.value.participants = [];
        }
        if (!editingTask.value.participants.includes(inputEditTaskParticipantValue.value)) {
          editingTask.value.participants.push(inputEditTaskParticipantValue.value);
        }
        inputEditTaskParticipantValue.value = '';
      }
      inputEditTaskParticipantVisible.value = false;
    };
    
    // 移除编辑任务参与人
    const removeEditTaskParticipant = (index) => {
      editingTask.value.participants.splice(index, 1);
    };

    // 添加任务
    const addTask = async () => {
      if (!newTask.name.trim()) {
        ElMessage.warning('任务名称不能为空');
        return;
      }
      
      // 创建新任务
      const task = {
        id: Date.now().toString(),
        name: newTask.name,
        description: newTask.description,
        assignee: newTask.assignee,
        participants: newTask.participants ? [...newTask.participants] : [],
        startDate: newTask.startDate,
        endDate: newTask.endDate,
        progress: newTask.progress,
        status: newTask.status,
        priority: newTask.priority
      };
      
      // 添加到项目任务列表
      if (!project.value.tasks) {
        project.value.tasks = [];
      }
      project.value.tasks.push(task);
      
      // 更新项目进度
      updateProjectProgress();
      
      try {
        // 保存到服务器
        await saveProjects();
        
        // 关闭对话框
        addTaskDialogVisible.value = false;
        
        // 提示成功
        ElMessage.success('任务添加成功');
        
        // 更新图表
        createChart();
      } catch (error) {
        ElMessage.error('任务添加失败');
      }
    };

    // 编辑任务
    const editTask = (task) => {
      editingTask.value = { 
        ...task,
        participants: task.participants ? [...task.participants] : []
      };
      editTaskDialogVisible.value = true;
    };

    // 更新任务
    const updateTask = async () => {
      if (!editingTask.value.name.trim()) {
        ElMessage.warning('任务名称不能为空');
        return;
      }
      
      // 查找并更新任务
      const index = project.value.tasks.findIndex(t => t.id === editingTask.value.id);
      if (index !== -1) {
        project.value.tasks[index] = { ...editingTask.value };
        
        // 更新项目进度
        updateProjectProgress();
        
        try {
          // 保存到服务器
          await saveProjects();
          
          // 关闭对话框
          editTaskDialogVisible.value = false;
          
          // 提示成功
          ElMessage.success('任务更新成功');
          
          // 更新图表
          createChart();
        } catch (error) {
          console.error('更新任务失败:', error);
          ElMessage.error('更新任务失败');
        }
      }
    };

    // 删除任务
    const deleteTask = (task) => {
      ElMessageBox.confirm(
        '确定要删除这个任务吗？此操作不可恢复。',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        // 查找并删除任务
        const index = project.value.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          project.value.tasks.splice(index, 1);
          
          // 更新项目进度
          updateProjectProgress();
          
          try {
            // 保存到服务器
            await saveProjects();
            
            // 提示成功
            ElMessage.success('任务删除成功');
            
            // 更新图表
            createChart();
          } catch (error) {
            console.error('删除任务失败:', error);
            ElMessage.error('删除任务失败');
          }
        }
      }).catch(() => {
        // 用户取消删除
      });
    };

    // 显示编辑项目对话框
    const showEditProjectDialog = () => {
      if (project.value) {
        editingProject.value = { 
          ...project.value,
          members: project.value.members ? [...project.value.members] : []
        };
        editProjectDialogVisible.value = true;
      }
    };
    
    // 显示项目成员输入框
    const showProjectMemberInput = () => {
      inputProjectMemberVisible.value = true;
      // 等待DOM更新后聚焦
      setTimeout(() => {
        projectMemberInputRef.value.focus();
      });
    };
    
    // 添加项目成员
    const addProjectMember = () => {
      if (inputProjectMemberValue.value) {
        if (!editingProject.value.members) {
          editingProject.value.members = [];
        }
        if (!editingProject.value.members.includes(inputProjectMemberValue.value)) {
          editingProject.value.members.push(inputProjectMemberValue.value);
        }
        inputProjectMemberValue.value = '';
      }
      inputProjectMemberVisible.value = false;
    };
    
    // 移除项目成员
    const removeProjectMember = (index) => {
      editingProject.value.members.splice(index, 1);
    };

    // 更新项目
    const updateProject = async () => {
      if (!editingProject.value.name.trim()) {
        ElMessage.warning('项目名称不能为空');
        return;
      }
      
      // 更新项目信息
      Object.assign(project.value, {
        name: editingProject.value.name,
        description: editingProject.value.description,
        startDate: editingProject.value.startDate,
        endDate: editingProject.value.endDate,
        manager: editingProject.value.manager,
        members: editingProject.value.members ? [...editingProject.value.members] : [],
        status: editingProject.value.status,
        progress: editingProject.value.progress
      });
      
      try {
        // 保存到服务器
        await saveProject(project.value);
        
        // 关闭对话框
        editProjectDialogVisible.value = false;
        
        // 提示成功
        ElMessage.success('项目更新成功');
      } catch (error) {
        console.error('更新项目失败:', error);
        ElMessage.error('更新项目失败');
      }
    };

    // 更新项目进度
    const updateProjectProgress = () => {
      if (project.value && project.value.tasks && project.value.tasks.length > 0) {
        // 计算项目总进度
        const totalTasks = project.value.tasks.length;
        const totalProgress = project.value.tasks.reduce((sum, task) => sum + task.progress, 0);
        
        // 更新项目进度
        project.value.progress = Math.round(totalProgress / totalTasks);
      } else {
        // 如果没有任务，进度为0
        project.value.progress = 0;
      }
    };

    // 保存项目数据到服务器
    const saveProjects = async () => {
      try {
        await saveProject(project.value);
        return true;
      } catch (error) {
        console.error('保存项目数据失败:', error);
        ElMessage.error('保存项目数据失败');
        return false;
      }
    };

    // 创建任务进度图表
    const createChart = () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      
      if (!chartCanvas.value || !project.value || !project.value.tasks || project.value.tasks.length === 0) {
        return;
      }
      
      const ctx = chartCanvas.value.getContext('2d');
      
      // 准备数据
      const statusCounts = {
        '待办': 0,
        '进行中': 0,
        '已完成': 0
      };
      
      project.value.tasks.forEach(task => {
        statusCounts[task.status]++;
      });
      
      // 优先级统计
      const priorityCounts = {
        '低': 0,
        '中': 0,
        '高': 0,
        '紧急': 0
      };
      
      project.value.tasks.forEach(task => {
        priorityCounts[task.priority]++;
      });
      
      // 创建图表
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['任务状态', '任务优先级'],
          datasets: [
            {
              label: '待办',
              data: [statusCounts['待办'], null],
              backgroundColor: '#909399'
            },
            {
              label: '进行中',
              data: [statusCounts['进行中'], null],
              backgroundColor: '#409EFF'
            },
            {
              label: '已完成',
              data: [statusCounts['已完成'], null],
              backgroundColor: '#67C23A'
            },
            {
              label: '低',
              data: [null, priorityCounts['低']],
              backgroundColor: '#67C23A'
            },
            {
              label: '中',
              data: [null, priorityCounts['中']],
              backgroundColor: '#409EFF'
            },
            {
              label: '高',
              data: [null, priorityCounts['高']],
              backgroundColor: '#E6A23C'
            },
            {
              label: '紧急',
              data: [null, priorityCounts['紧急']],
              backgroundColor: '#F56C6C'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未设置';
      return dateString;
    };

    // 获取状态类型
    const getStatusType = (status) => {
      switch (status) {
        case '待办':
          return 'info';
        case '进行中':
          return 'warning';
        case '已完成':
          return 'success';
        default:
          return 'info';
      }
    };

    // 获取进度状态
    const getProgressStatus = (progress) => {
      if (progress >= 100) return 'success';
      if (progress >= 70) return 'warning';
      if (progress >= 30) return '';
      return 'exception';
    };

    // 获取优先级类型
    const getPriorityType = (priority) => {
      switch (priority) {
        case '紧急':
          return 'danger';
        case '高':
          return 'warning';
        case '中':
          return 'info';
        case '低':
          return 'success';
        default:
          return 'info';
      }
    };

    // 获取进度标签
    const getProgressLabel = (progress) => {
      if (progress >= 100) return '已完成';
      if (progress >= 70) return '进展顺利';
      if (progress >= 30) return '进行中';
      return '需要加速';
    };

    // 获取进度颜色类名
    const getProgressColorClass = (progress) => {
      if (progress >= 100) return 'text-success';
      if (progress >= 70) return 'text-warning';
      if (progress >= 30) return 'text-primary';
      return 'text-danger';
    };

    // 获取进度标签类名
    const getProgressLabelClass = (progress) => {
      if (progress >= 100) return 'label-success';
      if (progress >= 70) return 'label-warning';
      if (progress >= 30) return 'label-primary';
      return 'label-danger';
    };

    // 监听路由参数变化
    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadProject();
      }
    });

    // 初始化
    onMounted(() => {
      loadProject();
      // 等待DOM更新后创建图表
      setTimeout(() => {
        createChart();
      }, 300);
    });

    // 在setup函数的最后返回所有需要在模板中使用的变量和方法
    return {
      project,
      taskFilter,
      taskSort,
      filteredAndSortedTasks,
      addTaskDialogVisible,
      newTask,
      editTaskDialogVisible,
      editingTask,
      editProjectDialogVisible,
      editingProject,
      priorityOptions,
      chartCanvas,
      projectMemberInputRef,
      inputProjectMemberVisible,
      inputProjectMemberValue,
      taskParticipantInputRef,
      inputTaskParticipantVisible,
      inputTaskParticipantValue,
      editTaskParticipantInputRef,
      inputEditTaskParticipantVisible,
      inputEditTaskParticipantValue,
      goBack,
      showAddTaskDialog,
      addTask,
      editTask,
      updateTask,
      deleteTask,
      showEditProjectDialog,
      updateProject,
      showProjectMemberInput,
      addProjectMember,
      removeProjectMember,
      showTaskParticipantInput,
      addTaskParticipant,
      removeTaskParticipant,
      showEditTaskParticipantInput,
      addEditTaskParticipant,
      removeEditTaskParticipant,
      formatDate,
      getStatusType,
      getProgressStatus,
      getPriorityType,
      getProgressLabel,
      getProgressColorClass,
      getProgressLabelClass
    };
  }
};
</script>

<style scoped>
.project-detail-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #fff;
  transition: all 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.project-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 16px;
  color: #606266;
}

.project-info p {
  margin: 8px 0;
  display: flex;
  align-items: flex-start;
}

.project-info p strong {
  display: inline-block;
  min-width: 100px;
  color: #303133;
  margin-right: 8px;
}

.progress-wrapper {
  grid-column: 1 / -1;
  margin: 12px 0;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.progress-wrapper:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-header strong {
  font-size: 14px;
  color: #303133;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 600;
}

.custom-progress {
  margin: 6px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
}

.progress-label {
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.progress-date {
  color: #909399;
  font-size: 12px;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-primary {
  color: #409eff;
}

.text-danger {
  color: #f56c6c;
}

.label-success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.label-warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.label-primary {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.label-danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.member-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.chart-card, .task-list {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  background-color: #fff;
  transition: all 0.3s ease;
}

.chart-container {
  height: 300px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  width: 130px;
}

.task-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.task-progress {
  flex: 1;
}

.task-progress-text {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .project-info {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
