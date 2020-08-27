<template>
  <div class="cmlevel">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息辅助维护</el-breadcrumb-item>
      <el-breadcrumb-item>等级认定记录</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="14">
          <el-button type="danger" @click="delCmresults()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加年度工作业绩</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCmresultsList"
            @change="getCmresultsList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            style="width: 180px"
            v-model="queryInfo.cmYear"
            type="year"
            @clear="getCmresultsList"
            @change="getCmresultsList"
            placeholder="请选择时间" format="yyyy" value-format="yyyy">
          </el-date-picker>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCmresultsList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 年度工作业绩列表区域 -->
      <el-table :data="cmresultsList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cmRemarks"></el-table-column>
        <el-table-column label="工作年度" prop="cmYear"></el-table-column>
        <el-table-column label="工作业绩" prop="cmResult"></el-table-column>
        <el-table-column label="维护日期" prop="cmModificationDate"></el-table-column>
        <el-table-column label="维护人" prop="cmModificationPerson"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cmKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteCmresultById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加年度工作业绩的对话框 -->
      <el-dialog :close-on-click-modal="false" title="添加年度工作业绩" :visible.sync="addDialogVisible" width="45%"
                 @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
          <el-form-item label="客户经理：" prop="cmId">
            <el-select clearable v-model="addForm.cmId" placeholder="请选择客户经理">
              <el-option
                v-for="item in this.cminfos"
                :key="item.cmId"
                :label="item.cmName"
                :value="item.cmId" @click.native="bindCmName(item.cmName)">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工作年度：" prop="cmYear">
            <el-date-picker
              v-model="addForm.cmYear"
              type="year"
              placeholder="请选择工作年度" format="yyyy" value-format="yyyy">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="工作业绩：" prop="cmResult">
            <el-select clearable v-model="addForm.cmResult" placeholder="请选择工作业绩类型">
              <el-option
                v-for="item in this.workResults"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCmresult">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改年度工作业绩的对话框 -->
      <el-dialog :close-on-click-modal="false" title="修改年度工作业绩" :visible.sync="editDialogVisible" width="45%"
                 @close="editDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
          <el-form-item label="客户经理：" prop="cmId">
            <el-select clearable v-model="editForm.cmId" placeholder="请选择客户经理" disabled>
              <el-option
                v-for="item in this.cminfos"
                :key="item.cmId"
                :label="item.cmName"
                :value="item.cmId" @click.native="bindCmName(item.cmName)">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工作年度：" prop="cmYear">
            <el-date-picker
              v-model="editForm.cmYear"
              type="year"
              placeholder="请选择工作年度" format="yyyy" value-format="yyyy">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="工作业绩：" prop="cmResult">
            <el-select clearable v-model="editForm.cmResult" placeholder="请选择工作业绩类型">
              <el-option
                v-for="item in this.workResults"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCmresult">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      //验证年份是否存在
      var checkYear = async (rule, value, cb) => {
        const result = await this.checkYear(value)
        if (!result) {
          cb(new Error('当前客户经理的工作年份已有业绩，请修改！'))
        }
        return cb()
      }
      return {
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取年度工作业绩列表的参数对象
        queryInfo: {
          //查询经理编号
          cmId: '',
          //查询年度
          cmYear: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //所有工作业绩数据
        cmresultsList: [],
        //所有客户经理
        cminfos: [],
        //所有工作业绩类型数据
        workResults: [],
        //年度工作业绩总数
        total: 0,
        // 控制添加年度工作业绩对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改年度工作业绩对话框的显示与隐藏
        editDialogVisible: false,
        // 添加年度工作业绩的表单数据
        addForm: {
          cmId: '',
          cmYear: '',
          cmResult: '',
          cmRemarks: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmYear: [
            {required: true, message: '请选择年份', trigger: ['blur', 'change']},
            {validator: checkYear, trigger: 'blur'}
          ],
          cmResult: [
            {required: true, message: '请选择工作业绩', trigger: ['blur', 'change']},
          ],
        },
        // 修改年度工作业绩的表单数据
        editForm: {
          cmKey: '',
          cmId: '',
          cmYear: '',
          cmResult: '',
          cmRemarks: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: 'blur'}
          ],
          cmYear: [
            {required: true, message: '请选择年份', trigger: 'blur'},
            {validator: checkYear, trigger: 'blur'}
          ],
          cmResult: [
            {required: true, message: '请选择工作业绩', trigger: 'blur'},
          ],
        }
      }
    },
    created() {
      this.getCmresultsList()
    },
    methods: {
      //获取年度工作业绩列表
      async getCmresultsList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cmResults/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取年度工作业绩列表失败！')
        }
        this.cmresultsList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.cminfos = res.data.cminfos
        this.workResults = res.data.workResults
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCmresultsList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCmresultsList()
      },
      // 监听添加年度工作业绩对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
      },
      // 监听修改年度工作业绩对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
      },
      // 点击按钮，添加新年度工作业绩
      addCmresult() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加年度工作业绩的网络请求
          //console.log(this.addForm.dictPerms)
          const {data: res} = await this.$http.post('cmResults/addCmresult', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加年度工作业绩成功！')
          // 隐藏添加年度工作业绩的对话框
          this.addDialogVisible = false
          // 重新获取年度工作业绩列表数据
          this.getCmresultsList()
          //this.reload()
        })
      },
      //监听修改年度工作业绩的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cmResults/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询年度工作业绩信息失败！')
        }
        this.editForm = res.data.cmresults
        this.editDialogVisible = true;
      },
      // 点击按钮，修改年度工作业绩
      editCmresult() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加年度工作业绩的网络请求
          const {data: res} = await this.$http.post('cmResults/updateCmresult', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改年度工作业绩数据成功！')
          // 隐藏修改年度工作业绩的对话框
          this.editDialogVisible = false
          // 重新获取年度工作业绩列表数据
          this.getCmresultsList()
          //this.reload()
        })
      },
      //点击按钮，删除单个年度工作业绩
      async deleteCmresultById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该年度工作业绩, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)

        // 如果用户确认删除，则返回值为字符串 confirm
        // 如果用户取消了删除，则返回值为字符串 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: result} = await this.$http.delete('cmResults/delCmresult/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除年度工作业绩失败！')
        }
        this.$message.success('删除年度工作业绩成功！')
        this.getCmresultsList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除年度工作业绩
      async delCmresults() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除年度工作业绩数据, 是否继续?',
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).catch(err => err)

          // 如果用户确认删除，则返回值为字符串 confirm
          // 如果用户取消了删除，则返回值为字符串 cancel
          // console.log(confirmResult)
          if (confirmResult !== 'confirm') {
            return this.$message.info('已取消删除')
          }
        } else {
          return this.$message.info('您未选择数据')
        }
        //console.log(params)
        const {data: result} = await this.$http.delete('cmResults/delCmresults/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除年度工作业绩数据失败！')
        }
        this.$message.success('删除年度工作业绩数据成功！')
        this.getCmresultsList()
        //this.reload()
      },
      bindCmName(cmName) {
        this.addForm.cmRemarks = cmName
        this.editForm.cmRemarks = cmName
      },
      async checkYear(year) {
        const formData = new FormData()
        formData.append('year', year)
        if (this.addDialogVisible) {
          formData.append('cmId', this.addForm.cmId)
        }
        if (this.editDialogVisible) {
          return true
        }
        const {data: res} = await this.$http.post('cmResults/checkYear', formData)
        if (res.status !== 200) {
          return false
        }
        return true
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-form-item .el-input {
    width: 250px;
  }

  .el-form-item .el-date-picker {
    width: 250px;
  }

  .el-form-item .el-select {
    width: 250px;
  }

  .el-form-item .el-cascader {
    width: 250px;
  }

  .el-table {
    max-height: 410px;
    overflow: auto;
  }
</style>
