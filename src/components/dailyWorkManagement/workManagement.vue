<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常工作管理</el-breadcrumb-item>
      <el-breadcrumb-item>工作管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="13">
          <el-button type="danger" @click="delCminfoWorks()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加工作记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCminfoWorkList"
            @change="getCminfoWorkList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker style="width: 160px;" clearable type="date" placeholder="选择日期"
                          v-model="queryInfo.cmDate"
                          format="yyyy-MM-dd" value-format="yyyy-MM-dd" @clear="getCminfoWorkList"
                          @change="getCminfoWorkList"></el-date-picker>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCminfoWorkList">搜索</el-button>
        </el-col>
      </el-row>
      <!-- 工作记录列表区域 -->
      <el-table :data="cminfoWorkList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="日期" prop="cmDate"></el-table-column>
        <el-table-column label="客户维护" prop="cmManagement"></el-table-column>
        <el-table-column label="产品信息" prop="cmProduct"></el-table-column>
        <el-table-column label="贷后管理" prop="cmLoan"></el-table-column>
        <el-table-column label="风险预警" prop="cmWarning"></el-table-column>
        <el-table-column label="发现问题" prop="cmIssue"></el-table-column>
        <el-table-column label="工作建议及感悟" prop="cmWorkProposal"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cmKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="delCminfoWorkById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加工作记录的对话框 -->
    <el-dialog title="添加工作记录" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="客户维护：" prop="cmManagement">
          <el-input type="textarea" v-model="addForm.cmManagement" placeholder="请输入客户维护"></el-input>
        </el-form-item>
        <el-form-item label="产品信息：" prop="cmProduct">
          <el-input type="textarea" v-model="addForm.cmProduct" placeholder="请输入产品信息"></el-input>
        </el-form-item>
        <el-form-item label="贷后管理：" prop="cmLoan">
          <el-input type="textarea" v-model="addForm.cmLoan" placeholder="请输入贷后管理"></el-input>
        </el-form-item>
        <el-form-item label="风险预警：" prop="cmWarning">
          <el-input type="textarea" v-model="addForm.cmWarning" placeholder="请输入风险预警"></el-input>
        </el-form-item>
        <el-form-item label="发现问题：" prop="cmIssue">
          <el-input type="textarea" v-model="addForm.cmIssue" placeholder="请输入发现问题"></el-input>
        </el-form-item>
        <el-form-item label="工作建议及感悟：" prop="cmWorkProposal">
          <el-input type="textarea" v-model="addForm.cmWorkProposal" placeholder="请输入工作建议及感悟"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCminfoWork">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改工作记录的对话框 -->
    <el-dialog title="修改工作记录" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px">
        <el-form-item label="客户维护：" prop="cmManagement">
          <el-input type="textarea" v-model="editForm.cmManagement" placeholder="请输入客户维护"></el-input>
        </el-form-item>
        <el-form-item label="产品信息：" prop="cmProduct">
          <el-input type="textarea" v-model="editForm.cmProduct" placeholder="请输入产品信息"></el-input>
        </el-form-item>
        <el-form-item label="贷后管理：" prop="cmLoan">
          <el-input type="textarea" v-model="editForm.cmLoan" placeholder="请输入贷后管理"></el-input>
        </el-form-item>
        <el-form-item label="风险预警：" prop="cmWarning">
          <el-input type="textarea" v-model="editForm.cmWarning" placeholder="请输入风险预警"></el-input>
        </el-form-item>
        <el-form-item label="发现问题：" prop="cmIssue">
          <el-input type="textarea" v-model="editForm.cmIssue" placeholder="请输入发现问题"></el-input>
        </el-form-item>
        <el-form-item label="工作建议及感悟：" prop="cmWorkProposal">
          <el-input type="textarea" v-model="editForm.cmWorkProposal" placeholder="请输入工作建议及感悟"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCminfoWork">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      return {
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取工作记录列表的参数对象
        queryInfo: {
          //查询客户经理编号
          cmId: '',
          //查询日期
          cmDate: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //工作记录列表
        cminfoWorkList: [],
        //工作记录总数
        total: 0,
        // 控制添加工作记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改工作记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加工作记录的表单数据
        addForm: {
          cmManagement: '',
          cmProduct: '',
          cmLoan: '',
          cmWarning: '',
          cmIssue: '',
          cmWorkProposal: '',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmManagement: [
            {required: true, message: '请输入客户维护', trigger: 'blur'},
            {min: 2, max: 255, message: '客户维护的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmProduct: [
            {required: true, message: '请输入产品信息', trigger: 'blur'},
            {min: 2, max: 255, message: '产品信息的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmLoan: [
            {required: true, message: '请输入贷后管理', trigger: 'blur'},
            {min: 2, max: 255, message: '贷后管理的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmWarning: [
            {required: true, message: '请输入风险预警', trigger: 'blur'},
            {min: 2, max: 255, message: '风险预警的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmIssue: [
            {required: true, message: '请输入发现问题', trigger: 'blur'},
            {min: 2, max: 255, message: '发现问题的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmWorkProposal: [
            {required: true, message: '请输入工作建议及感悟', trigger: 'blur'},
            {min: 2, max: 255, message: '工作建议及感悟的长度在2~255个字符之间', trigger: 'blur'}
          ]
        },
        // 修改工作记录的表单数据
        editForm: {
          cmKey: '',
          cmManagement: '',
          cmProduct: '',
          cmLoan: '',
          cmWarning: '',
          cmIssue: '',
          cmWorkProposal: '',
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmManagement: [
            {required: true, message: '请输入客户维护', trigger: 'blur'},
            {min: 2, max: 255, message: '客户维护的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmProduct: [
            {required: true, message: '请输入产品信息', trigger: 'blur'},
            {min: 2, max: 255, message: '产品信息的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmLoan: [
            {required: true, message: '请输入贷后管理', trigger: 'blur'},
            {min: 2, max: 255, message: '贷后管理的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmWarning: [
            {required: true, message: '请输入风险预警', trigger: 'blur'},
            {min: 2, max: 255, message: '风险预警的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmIssue: [
            {required: true, message: '请输入发现问题', trigger: 'blur'},
            {min: 2, max: 255, message: '发现问题的长度在2~255个字符之间', trigger: 'blur'}
          ],
          cmWorkProposal: [
            {required: true, message: '请输入工作建议及感悟', trigger: 'blur'},
            {min: 2, max: 255, message: '工作建议及感悟的长度在2~255个字符之间', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getCminfoWorkList()
    },
    methods: {
      //获取工作记录列表
      async getCminfoWorkList() {
        const {data: res} = await this.$http.get('cminfoWork/list', {
          params: this.queryInfo
        })
        console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取工作记录列表失败！')
        }
        this.cminfoWorkList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.loading = false
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCminfoWorkList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCminfoWorkList()
      },
      // 监听添加工作记录对话框的关闭事件
      addDialogClosed() {
        this.$refs['addFormRef'].resetFields()
        Object.assign(this.$data.addForm, this.$options.data().addForm)
      },
      // 监听修改工作记录对话框的关闭事件
      editDialogClosed() {
        this.$refs['editFormRef'].resetFields()
        Object.assign(this.$data.editForm, this.$options.data().editForm)
      },
      // 点击按钮，添加新工作记录
      addCminfoWork() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加工作记录的网络请求
          // console.log(this.addForm)
          //console.log(this.participants.toString())
          const {data: res} = await this.$http.post('cminfoWork/addCminfoWork', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error('添加工作记录失败！')
          }
          this.$message.success('添加工作记录成功！')
          // 隐藏添加工作记录的对话框
          this.addDialogVisible = false
          // 重新获取工作记录列表数据
          this.getCminfoWorkList()
          this.reload()
        })
      },
      //监听修改工作记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cminfoWork/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询工作记录信息失败！')
        }
        this.editForm = res.data.cminfoWork
        this.editDialogVisible = true;
      },
      // 点击按钮，修改工作记录
      editCminfoWork() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加工作记录的网络请求
          const {data: res} = await this.$http.post('cminfoWork/updateCminfoWork', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error('修改工作记录数据失败！')
          }
          this.$message.success('修改工作记录数据成功！')
          // 隐藏修改工作记录的对话框
          this.editDialogVisible = false
          // 重新获取工作记录列表数据
          this.getCminfoWorkList()
          this.reload()
        })
      },
      //点击按钮，删除单个工作记录
      async delCminfoWorkById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该工作记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('cminfoWork/delCminfoWork/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除工作记录失败！')
        }
        this.$message.success('删除工作记录成功！')
        this.getCminfoWorkList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除工作记录
      async delCminfoWorks() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除工作记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cminfoWork/delCminfoWorks/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除工作记录数据失败！')
        }
        this.$message.success('删除工作记录数据成功！')
        this.getCminfoWorkList()
        this.reload()
      },
    }
  }
</script>

<style lang="less" scoped>
  .el-select .el-input {
    width: 130px;
  }

  .el-table {
    max-height: 450px;
    overflow: auto;
  }
</style>
