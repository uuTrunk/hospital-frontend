<template>
  <el-container class="home-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" min-height="100vh" background-color="#001529">
      <div style="height:60px; line-height:60px; padding-left: 20px;">
        <img src="../assets/logo3.png" alt="logo3">
        <span color="#fff">医护管理系统</span>
      </div>
      <el-menu :router="true"
        background-color="#001529"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#ffd04b"
        style="border:none">
        <!-- 一级菜单 -->
        <el-submenu index="1">
          <!-- 一级菜单的模板区域-->
          <template slot="title">
            <!-- 图标 -->
            <i class="el-icon-s-check"></i>
            <!-- 文本 -->
            <span>离入院管理</span>
          </template>

          <!-- 二级菜单 -->
          <el-menu-item index="/admission-assessment">
            <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-s-claim"></i>
              <span>入院评估</span>
            </template>
          </el-menu-item>

          <el-menu-item index="/discharge">
            <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-s-release"></i>
              <span>离院办理</span>
            </template>
          </el-menu-item>
        </el-submenu>

        <el-menu-item index="health-record">
          <i class="el-icon-files"></i>
          <span slot="title">健康档案</span>
        </el-menu-item>

        <el-menu-item index="3">
          <i class="el-icon-document"></i>
          <span slot="title">查房管理</span>
        </el-menu-item>
        <el-menu-item index="/medical-management">
          <i class="el-icon-setting"></i>
          <span slot="title">医嘱管理</span>
        </el-menu-item>
        <el-menu-item index="5">
          <i class="el-icon-setting"></i>
          <span slot="title">病例处方</span>
        </el-menu-item>
        <el-menu-item index="6">
          <i class="el-icon-setting"></i>
          <span slot="title">处方用药</span>
        </el-menu-item>
        <el-menu-item index="7">
          <i class="el-icon-setting"></i>
          <span slot="title">慢病管理</span>
        </el-menu-item>
        <el-menu-item index="8">
          <i class="el-icon-setting"></i>
          <span slot="title">药房管理</span>
        </el-menu-item>
        <el-menu-item index="9">
          <i class="el-icon-setting"></i>
          <span slot="title">配置维护</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 头部区域 -->
      <el-header style="height: 60px; display: flex; align-items: center;">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right" style="margin: 20px;">
          <el-breadcrumb-item to="/home" style="color: #fff; font-weight: 500;">首页</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 头部右侧操作按钮 -->
        <div class="user-info">
          <el-dropdown placement="bottom">
            <div class="user-profile">
              <img src="../assets/logo.jpg" alt="" class="avatar">
              <span class="username">管理员</span>
              <i class="el-icon-arrow-down"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <!-- 右侧主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'HomeView',
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  
  /deep/ .el-breadcrumb__inner {
    color: #fff !important;
    font-weight: 500;
    
    &:hover {
      color: #ffd04b !important;
    }
  }
  
  /deep/ .el-breadcrumb__separator {
    color: #fff;
  }
}

.el-aside {
  background-color: #001529;
  color: #fff;
  
  img {
    width: 20%;
    height: 70%;
    background-color: #0a0a0a;
    margin-right: 10px;
  }
  
  > div {
    display: flex;
    align-items: center;
    padding-left: 20px;
  }
  
  span {
    margin-left: 10px;
    color: #fff;
    font-size: 16px;
  }
}

.el-main {
  background-color: #f5f5f5;
}

.el-aside {
  .el-menu {
    border-right: none;
    padding-left: 0;

    .el-submenu__title,
    .el-menu-item,
    .el-submenu {
      padding-left: 0px !important;
      text-align: left;
      justify-content: flex-start;
    }

    .el-menu-item {
      padding-left: 20px !important;
    }

    i {
      margin-right: 8px;
    }

    .el-submenu__icon-arrow {
      right: 10px;
    }
  }
}

.el-menu--inline .el-menu-item {
  background-color: #253545 !important
}

.el-menu-item:hover,
.el-submenu__title:hover {
  color: #fff !important
}

.el-submenu__title:hover i,
.el-menu-item:hover i {
  color: #fff !important
}

.user-info {
  position: fixed;
  top: 0;
  right: 20px;
  height: 60px;
  display: flex;
  align-items: center;
  z-index: 1000;

  .user-profile {
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 60px;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      
      .username {
        color: #fff;
      }
      
      .el-icon-arrow-down {
        color: #fff;
      }
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .username {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
      margin-right: 4px;
      transition: color 0.3s ease;
    }

    .el-icon-arrow-down {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.85);
      transition: color 0.3s ease;
    }
  }

  /deep/ .el-dropdown-menu {
    padding: 4px 0;
    
    .el-dropdown-menu__item {
      line-height: 36px;
      padding: 0 20px;
      font-size: 14px;
      
      &:hover {
        background-color: #f5f7fa;
        color: #409EFF;
      }
      
      i {
        margin-right: 8px;
      }
    }
  }
}
</style> 