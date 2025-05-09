// API 服务
import CONFIG from '../config';
const API_URL = CONFIG.API_URL;

/**
 * 获取所有项目
 * @returns {Promise<Array>} 项目列表
 */
export const getProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error('获取项目失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取项目错误:', error);
    throw error;
  }
};

/**
 * 获取单个项目
 * @param {string} id 项目ID
 * @returns {Promise<Object>} 项目详情
 */
export const getProject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error('获取项目详情失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取项目详情错误:', error);
    throw error;
  }
};

/**
 * 创建新项目
 * @param {Object} project 项目数据
 * @returns {Promise<Object>} 创建的项目
 */
export const createProject = async (project) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('创建项目失败');
    }
    return await response.json();
  } catch (error) {
    console.error('创建项目错误:', error);
    throw error;
  }
};

/**
 * 更新项目
 * @param {string} id 项目ID
 * @param {Object} project 项目数据
 * @returns {Promise<Object>} 更新后的项目
 */
export const updateProject = async (id, project) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    if (!response.ok) {
      throw new Error('更新项目失败');
    }
    return await response.json();
  } catch (error) {
    console.error('更新项目错误:', error);
    throw error;
  }
};

/**
 * 删除项目
 * @param {string} id 项目ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除项目失败');
    }
    return await response.json();
  } catch (error) {
    console.error('删除项目错误:', error);
    throw error;
  }
};

/**
 * 获取所有用户
 * @returns {Promise<Array>} 用户列表
 */
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('获取用户失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取用户错误:', error);
    throw error;
  }
};
