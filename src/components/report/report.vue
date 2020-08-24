<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报表管理</el-breadcrumb-item>
      <el-breadcrumb-item>报表管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="3">
          <el-select v-model="queryInfo.cmUnit" clearable placeholder="请选择单位" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmUnit_arr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="queryInfo.cmStatus" clearable placeholder="请选择状态" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmStatus_arr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="queryInfo.cmSex" clearable placeholder="请选择性别" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmSex_arr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select v-model="queryInfo.cmEducation" clearable placeholder="请选择学历" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmEducation_arr"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-cascader
            clearable
            v-model="technicalTitle"
            :options="cmProfessionalTitles_arr"
            :props="{ expandTrigger: 'hover' }"
            @change="technicalTitleHandleChange" placeholder="请选择专业技术职称"></el-cascader>
        </el-col>
        <el-col :span="4">
          <el-select v-model="queryInfo.cmLevel" clearable placeholder="请选择客户经理等级" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmLevel_arr"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" icon="el-icon-search" @click="getcmsList">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="success" icon="el-icon-upload2" @click="reportExcel">导出</el-button>
        </el-col>
      </el-row>
      <!-- 客户经理列表区域 -->
      <el-table id="reportTable" name="reportTable" :data="cmsList" row-key="cmId" border stripe v-loading="loading">
        <el-table-column
          label="序号"
          type="index"
          width="50">
        </el-table-column>
        <el-table-column label="客户经理编号" prop="cmId" width="110px"></el-table-column>
        <el-table-column label="姓名" prop="cmName"></el-table-column>
        <el-table-column label="性别" prop="cmSex" width="60px">
          <template slot-scope="scope">{{ scope.row.cmSex === '1' ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column label="客户经理等级" prop="cmLevel" width="110px"></el-table-column>
        <el-table-column label="单位" prop="cmUnit" width="60px"></el-table-column>
        <el-table-column label="部门" prop="cmDept" width="100px"></el-table-column>
        <el-table-column label="业务条线" prop="cmBusinessLines"></el-table-column>
        <el-table-column label="职务" prop="cmPosition"></el-table-column>
        <el-table-column label="从业年限" prop="cmWorkingYears"></el-table-column>
        <el-table-column label="联系电话" prop="cmMobile" width="120px"></el-table-column>
        <el-table-column label="状态" prop="cmStatus" width="60px">
          <template slot-scope="scope">{{ scope.row.cmStatus === '1' ? '在职' : '退出' }}</template>
        </el-table-column>
        <el-table-column label="年龄" prop="cmAge" width="60px"></el-table-column>
        <el-table-column label="学历" prop="cmEducation" width="100px"></el-table-column>
        <el-table-column label="专业职称" prop="cmProfessionalTitles" width="210px"></el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10, 50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import FileSaver from 'file-saver'
  import XLSX from 'xlsx'

  export default {

    inject: ['reload'],
    data() {
      return {
        //后台获取所有学历
        cmEducation_arr: [],
        //后台获取所有等级
        cmLevel_arr: [],
        //所有技术职称
        cmProfessionalTitles_arr: [
          {
            value: '工程专业技术人员',
            label: '工程专业技术人员',
            children: [{
              value: '高级工程师',
              label: '高级工程师',
            }, {
              value: '工程师',
              label: '工程师',
            }, {
              value: '助理工程师',
              label: '助理工程师',
            }
            ]
          },
          {
            value: '经济专业技术人员',
            label: '经济专业技术人员',
            children: [{
              value: '高级经济师',
              label: '高级经济师',
            }, {
              value: '经济师',
              label: '经济师',
            }, {
              value: '助理经济师',
              label: '助理经济师',
            }
            ]
          },
          {
            value: '会计专业技术人员',
            label: '会计专业技术人员',
            children: [{
              value: '高级会计师',
              label: '高级会计师',
            }, {
              value: '会计师',
              label: '会计师',
            }, {
              value: '助理会计师',
              label: '助理会计师',
            }
            ]
          },
          {
            value: '统计专业技术人员',
            label: '统计专业技术人员',
            children: [{
              value: '高级统计师',
              label: '高级统计师',
            }, {
              value: '统计师',
              label: '统计师',
            }, {
              value: '助理统计师',
              label: '助理统计师',
            }
            ]
          },
          {
            value: '审计专业技术人员',
            label: '审计专业技术人员',
            children: [{
              value: '高级审计师',
              label: '高级审计师',
            }, {
              value: '审计师',
              label: '审计师',
            }, {
              value: '助理审计师',
              label: '助理审计师',
            }
            ]
          },
          {
            value: '政工专业技术人员',
            label: '政工专业技术人员',
            children: [{
              value: '高级政工师',
              label: '高级政工师',
            }, {
              value: '政工师',
              label: '政工师',
            }, {
              value: '助理政工师',
              label: '助理政工师',
            }
            ]
          }
        ],
        //所在单位
        cmUnit_arr: [
          {value: '支行', label: '支行'},
          {value: '网点', label: '网点'}
        ],
        //性别数组
        cmSex_arr: [
          {value: '0', label: '女'},
          {value: '1', label: '男'}
        ],
        //经理状态数组
        cmStatus_arr: [
          {
            value: '1',
            label: '在职'
          }, {
            value: '0',
            label: '退出'
          }
        ],
        //选择后的技术职称数组
        technicalTitle: [],
        // 获取客户经理列表的参数对象
        queryInfo: {
          //单位查询字段
          cmUnit: '',
          //经理状态查询字段
          cmStatus: '',
          //经理性别查询字段
          cmSex: '',
          //经理学历查询字段
          cmEducation: '',
          //经理专业技术职称
          cmProfessionalTitles: '',
          //经理等级
          cmLevel: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //表格加载
        loading: true,
        //客户经理列表
        cmsList: [],
        //客户经理总数
        total: 0,
      }
    },
    created() {
      this.getcmsList()
    },
    methods: {
      //获取客户经理列表
      async getcmsList() {
        //console.log(this.queryInfo)
        if (this.queryInfo.cmProfessionalTitles == 'undefined-undefined') {
          this.queryInfo.cmProfessionalTitles = ''
        }
        const {data: res} = await this.$http.get('cminfo/reportList', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取客户经理列表失败！')
        }
        this.cmsList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.cmEducation_arr = res.data.cmEducation_arr
        this.cmLevel_arr = res.data.cmLevel_arr
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getcmsList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getcmsList()
      },
      //专业职称选择后方法
      technicalTitleHandleChange(value) {
        if (value != null) {
          this.queryInfo.cmProfessionalTitles = value[0] + "-" + value[1]
        } else {
          this.queryInfo.cmProfessionalTitles = ''
        }
        this.getcmsList();
      },
      clearTechnicalTitle() {
        console.log("你好")
        this.queryInfo.cmProfessionalTitles = '';
        this.getcmsList();
      },
      reportExcel() {
        /* generate workbook object from table */
        var xlsxParam = {raw: true} // 导出的内容只做解析，不进行格式转换
        var wb = XLSX.utils.table_to_book(document.querySelector('#reportTable'), xlsxParam)

        /* get binary string as output */
        var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'array'})
        try {
          FileSaver.saveAs(new Blob([wbout], {type: 'application/octet-stream'}), '客户经理信息表.xlsx')
        } catch (e) {
          if (typeof console !== 'undefined') {
            console.log(e, wbout)
          }
        }
        return wbout
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }

  .el-table {
    max-height: 450px;
    overflow: auto;
  }
</style>
