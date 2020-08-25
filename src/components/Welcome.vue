<template>
  <div id="banner">
        <!--动态将图片轮播图的容器高度设置成与图片一致-->
    <el-carousel :height="bannerHeight + 'px'">
      <!--遍历图片地址,动态生成轮播图-->
      <el-carousel-item v-for="item in img_list" :key="item.value">
        <img :src="item.label" style="width: 100%;height: 100%"/>
      </el-carousel-item>
    </el-carousel>
    <br/>
    <el-divider><i class="el-icon-coordinate"></i></el-divider>
    <div style="text-align: center">
      <br/>
      <span style="font-size: 30px;font-family: 楷体;color: #009882">您好，欢迎访问贵州农行客户经理信息管理系统</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Banner",
    data() {
      return {
        // 图片地址数组
        img_list: [
          {value: '1', label: require('../assets/images/1.jpg')},
          {value: '2', label: require('../assets/images/2.jpg')},
          {value: '3', label: require('../assets/images/3.jpg')},
          {value: '4', label: require('../assets/images/4.jpg')},
          {value: '5', label: require('../assets/images/5.jpg')},
          {value: '6', label: require('../assets/images/6.jpg')},
        ],
        // 图片父容器高度
        bannerHeight: 1000,
        // 浏览器宽度
        screenWidth: 0
      };
    },
    methods: {
      setSize: function () {
        // 通过浏览器宽度(图片宽度)计算高度
        this.bannerHeight = (400 / 1920) * this.screenWidth
      }
    },

    mounted() {
      // 首次加载时,需要调用一次
      this.screenWidth = window.innerWidth;
      this.setSize();
      // 窗口大小发生改变时,调用一次
      window.onresize = () => {
        this.screenWidth = window.innerWidth;
        this.setSize();
      };
    }
  };
</script>


<style scoped>

  .el-carousel__item h3  {

      color:   #475669;

      font-size:  14px;

      opacity:  0 .75;

      line-height:  300px;

      margin:  0;

  }

  .el-carousel__item:nth-child(2n)   {

      background-color:   #99a9bf;

  }

  .el-carousel__item:nth-child(2n + 1)   {

      background-color:   #d3dce6;

  }

  img  {

      width: 100%;

      height:  inherit;

  }

</style>
