<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header :class="themeColor">
      <div>
        <img src="../assets/chang.jpg" alt="" style="width: 200px">
        <span>贵州农行客户经理信息管理系统</span>
      </div>
      <!--主题颜色-->
      <div>
        <el-select v-model="themeColor" placeholder="请选择主题颜色" @change="changeTheme(themeColor)">
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.label"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>欢迎您，{{username}}</span>
      </div>
      <div>
        <el-button type="warning" @click="logout">退出</el-button>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" :class="themeColor">
        <div class="toggle-button" @click="toggleCollapse" :class="themeColor">
          <i :class="shrink_open?'el-icon-caret-left':'el-icon-caret-right'"></i>
        </div>
        <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#EFFBEF" text-color="#190707" active-text-color="#409EFF" unique-opened
                 :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.menuId + ''" v-for="item in menuParents" :key="item.menuId">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="item.menuIcon"></i>
              <!-- 文本 -->
              <span>{{item.menuName}}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.menuUrl" v-for="subItem in item.menus" :key="subItem.menuId"
                          @click="saveNavState('/' + subItem.menuUrl)">
              <template slot="title">
                <!-- 图标 -->
                <i :class="subItem.menuIcon"></i>
                <!-- 文本 -->
                <span>{{subItem.menuName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        //用户名
        username: '',
        //主题颜色
        options: [
          {
            id: 't_green',
            color: '#009882',
            label: '农行绿'
          }, {
            id: 't_blue',
            color: '#045FB4',
            label: '深沉蓝'
          }, {
            id: 't_black',
            color: '#424242',
            label: '低调黑'
          }],
        themeColor: 't_green',
        //左侧菜单栏是否伸展收缩
        shrink_open: true,
        // 左侧菜单数据
        menuParents: [],
        // 是否折叠
        isCollapse: false,
        // 被激活的链接地址
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.localStorage.getItem('activePath')
      this.username = window.localStorage.getItem('username')
    },
    methods: {
      //更换主题
      changeTheme(themeColor) {
        this.themeColor = themeColor
        //console.log(themeColor)
      },
      //退出登录
      logout() {
        window.localStorage.clear()
        this.$router.push('/login')
      },
      // 获取所有的菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menu/list')
        if (res.status !== 200) return this.$message.error("获取菜单列表失败！")
        this.menuParents = res.data.menuParents
        //console.log(res)
      },
      // 点击按钮，切换菜单的折叠与展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
        this.shrink_open = !this.shrink_open
      },
      // 保存链接的激活状态
      saveNavState(activePath) {
        window.localStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>

  //主题颜色农行绿
  .t_green {
    background-color: #009882;
  }

  //主题颜色深沉蓝
  .t_blue {
    background-color: #045FB4;
  }

  //主题颜色低调黑
  .t_black {
    background-color: #424242;
  }

  .home-container {
    height: 100%;
  }

  .el-header {
    //background-color: #009882;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    //background-color: #009882;
    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #E0F8EC;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    //background-color: #009882;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
