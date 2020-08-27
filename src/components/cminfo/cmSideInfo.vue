<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="年度工作业绩" name="cmResults">
        <cmResults></cmResults>
      </el-tab-pane>
      <el-tab-pane label="证照列表" name="certificate">
        <certificate></certificate>
      </el-tab-pane>
      <el-tab-pane label="奖惩记录" name="cmrpr">
        <cmrpr></cmrpr>
      </el-tab-pane>
      <el-tab-pane label="考核记录" name="cmass">
        <cmass></cmass>
      </el-tab-pane>
      <el-tab-pane label="学习培训记录" name="cmltr">
        <cmltr></cmltr>
      </el-tab-pane>
      <el-tab-pane label="等级认定记录" name="cmlevel">
        待开发
      </el-tab-pane>
      <el-tab-pane label="工作经历" name="cmwork">
        待开发
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
  import cmResults from '../cmSideInfos/cmResults'
  import certificate from '../cmSideInfos/certificate'
  import cmrpr from '../cmSideInfos/cmrpr'
  import cmass from '../cmSideInfos/cmass'
  import cmltr from '../cmSideInfos/cmltr'
  import cmlevel from '../cmSideInfos/cmlevel'
  import cmwork from '../cmSideInfos/cmwork'

  export default {
    components: {
      cmResults: cmResults,
      certificate: certificate,
      cmrpr: cmrpr,
      cmass: cmass,
      cmltr: cmltr,
      cmlevel: cmlevel,
      cmwork: cmwork,
    },
    data() {
      return {
        activeName: 'cmResults'
      };
    },
    created() {
      this.activeName = window.localStorage.getItem('activeName')
    },
    methods: {
      handleClick(tab, event) {
        window.localStorage.setItem('activeName', tab.name)
        this.activeName = tab.name
      }
    }
  };
</script>
