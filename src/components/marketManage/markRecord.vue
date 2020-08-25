<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>营销管理</el-breadcrumb-item>
      <el-breadcrumb-item>营销记录管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="14">
          <el-button type="danger" @click="delMarkRecords()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加营销记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理编号"
            v-model="queryInfo.cCmId"
            clearable
            @clear="getMarkRecordList"
            @change="getMarkRecordList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户姓名"
            v-model="queryInfo.cName"
            clearable
            @clear="getMarkRecordList"
            @change="getMarkRecordList">
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getMarkRecordList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 营销记录列表区域 -->
      <el-table :data="markRecordList" row-key="cKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cName" width="70"></el-table-column>
        <el-table-column label="客户生产经营情况" prop="cManagement" width="80"></el-table-column>
        <el-table-column label="客户需求" prop="cDemand" width="80"></el-table-column>
        <el-table-column label="客户拜访报告书">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/upload/'+scope.row.cCmId+'/'+scope.row.cId+'/'+scope.row.cReport"
               :download="scope.row.cReport">
              {{scope.row.cReport}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="客户推荐表">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/upload/'+scope.row.cCmId+'/'+scope.row.cId+'/'+scope.row.cTestimonials"
               :download="scope.row.cTestimonials">
              {{scope.row.cTestimonials}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="客户综合评价">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/upload/'+scope.row.cCmId+'/'+scope.row.cId+'/'+scope.row.cEvaluation"
               :download="scope.row.cEvaluation">
              {{scope.row.cEvaluation}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="拜访日期" prop="cDate"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteMarkRecordById(scope.row.cKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加营销记录的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加营销记录" :visible.sync="addDialogVisible" width="45%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
        <el-form-item label="客户姓名：" prop="cName">
          <el-select v-model="addForm.cName" placeholder="请选择客户">
            <el-option
              v-for="item in this.cinfos"
              :key="item.cKey"
              :label="item.cName"
              :value="item.cName" @click.native="bindCId(item.cKey)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户生产经营情况：" prop="cManagement">
          <el-select v-model="addForm.cManagement" placeholder="请选择经营情况">
            <el-option
              v-for="item in this.businessSituation"
              :key="item.label"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户需求：" prop="cDemand">
          <el-input type="textarea" v-model="addForm.cDemand"></el-input>
        </el-form-item>
        <el-form-item label="客户拜访报告书：" prop="cReport">
          <el-upload
            :on-remove="removeCReport"
            ref="addCReportRef"
            action="#"
            :limit="1"
            :http-request="getCReportFile">
            <el-button size="small" type="success">选择客户拜访报告书</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户推荐表：" prop="cTestimonials">
          <el-upload
            :on-remove="removeCTestimonials"
            ref="addCTestimonialsRef"
            action="#"
            :limit="1"
            :http-request="getCTestimonialsFile">
            <el-button size="small" type="success">选择客户推荐表</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户综合评价：" prop="cEvaluation">
          <el-upload
            :on-remove="removeCEvaluation"
            ref="addCEvaluationRef"
            action="#"
            :limit="1"
            :http-request="getCEvaluationFile">
            <el-button size="small" type="success">选择客户综合评价</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户拜访日期：" prop="cDate">
          <el-date-picker type="date" placeholder="选择客户拜访时间" v-model="addForm.cDate"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMarkRecord">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改营销记录的对话框 -->
    <el-dialog :close-on-click-modal="false" title="修改营销记录" :visible.sync="editDialogVisible" width="45%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
        <el-form-item label="客户姓名：" prop="cName">
          <el-select v-model="editForm.cName" placeholder="请选择客户">
            <el-option
              v-for="item in this.cinfos"
              :key="item.cKey"
              :label="item.cName"
              :value="item.cName" @click.native="bindCId(item.cKey)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户生产经营情况：" prop="cManagement">
          <el-select v-model="editForm.cManagement" placeholder="请选择经营情况">
            <el-option
              v-for="item in this.businessSituation"
              :key="item.label"
              :label="item.label"
              :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户需求：" prop="cDemand">
          <el-input type="textarea" v-model="editForm.cDemand"></el-input>
        </el-form-item>
        <el-form-item label="客户拜访报告书：" prop="cReport">
          <el-upload
            :on-remove="removeCReport"
            ref="editCReportRef"
            action="#"
            :limit="1"
            :http-request="getCReportFile">
            <el-button size="small" type="success">选择客户拜访报告书</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户推荐表：" prop="cTestimonials">
          <el-upload
            :on-remove="removeCTestimonials"
            ref="editCTestimonialsRef"
            action="#"
            :limit="1"
            :http-request="getCTestimonialsFile">
            <el-button size="small" type="success">选择客户推荐表</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户综合评价：" prop="cEvaluation">
          <el-upload
            :on-remove="removeCEvaluation"
            ref="editCEvaluationRef"
            action="#"
            :limit="1"
            :http-request="getCEvaluationFile">
            <el-button size="small" type="success">选择客户综合评价</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="客户拜访日期：" prop="cDate">
          <el-date-picker type="date" placeholder="选择客户拜访时间" v-model="editForm.cDate"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMarkRecord">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      return {
        //生产经营情况
        businessSituation: [
          {value: '1', label: '优秀'},
          {value: '2', label: '良好'},
          {value: '3', label: '一般'},
        ],
        //客户列表信息
        cinfos: [],
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取营销记录列表的参数对象
        queryInfo: {
          //查询客户经理编号
          cCmId: '',
          //查询客户姓名
          cName: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //营销记录列表
        markRecordList: [],
        //营销记录总数
        total: 0,
        // 控制添加营销记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改营销记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加营销记录的表单数据
        addForm: {
          cName: '',
          cManagement: '',
          cDemand: '',
          cReport: '',
          cTestimonials: '',
          cEvaluation: '',
          cDate: '',
          cId: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cName: [
            {required: true, message: '请选择客户', trigger: ['blur', 'change']}
          ],
          cManagement: [
            {required: true, message: '请选择客户生产经营情况', trigger: ['blur', 'change']}
          ],
          cDemand: [
            {required: true, message: '请输入客户需求', trigger: 'blur'},
            {min: 1, max: 255, message: '客户需求的长度在1~255个字符之间', trigger: 'blur'}
          ],
          cDate: [
            {required: true, message: '请选择拜访日期', trigger: ['blur', 'change']}
          ]
        },
        // 修改营销记录的表单数据
        editForm: {
          cKey: '',
          cName: '',
          cManagement: '',
          cDemand: '',
          cReport: '',
          cTestimonials: '',
          cEvaluation: '',
          cDate: '',
          cId: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cName: [
            {required: true, message: '请选择客户', trigger: ['blur', 'change']}
          ],
          cManagement: [
            {required: true, message: '请选择客户生产经营情况', trigger: ['blur', 'change']}
          ],
          cDemand: [
            {required: true, message: '请输入客户需求', trigger: 'blur'},
            {min: 1, max: 255, message: '客户需求的长度在1~255个字符之间', trigger: 'blur'}
          ],
          cDate: [
            {required: true, message: '请选择拜访日期', trigger: ['blur', 'change']}
          ]
        }
      }
    },
    created() {
      this.getMarkRecordList()
    },
    methods: {
      //获取营销记录列表
      async getMarkRecordList() {
        const {data: res} = await this.$http.get('markRecord/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取营销记录列表失败！')
        }
        this.markRecordList = res.data.pageInfo.list
        this.cinfos = res.data.cinfos
        this.total = res.data.pageInfo.total
        this.loading = false
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getMarkRecordList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getMarkRecordList()
      },
      // 监听添加营销记录对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.$refs.addCReportRef.clearFiles()
        this.$refs.addCTestimonialsRef.clearFiles()
        this.$refs.addCEvaluationRef.clearFiles()
        Object.assign(this.$data.addForm, this.$options.data().addForm)
      },
      // 监听修改营销记录对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.$refs.editCReportRef.clearFiles()
        this.$refs.editCTestimonialsRef.clearFiles()
        this.$refs.editCEvaluationRef.clearFiles()
        Object.assign(this.$data.editForm, this.$options.data().editForm)
      },
      // 点击按钮，添加新营销记录
      addMarkRecord() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加营销记录的网络请求
          // console.log(this.addForm)
          const {data: res} = await this.$http.post('markRecord/addMarkRecord', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error('添加营销记录失败！')
          }
          this.$message.success('添加营销记录成功！')
          // 隐藏添加营销记录的对话框
          this.addDialogVisible = false
          // 重新获取营销记录列表数据
          this.getMarkRecordList()
          this.reload()
        })
      },
      //监听修改营销记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('markRecord/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询营销记录信息失败！')
        }
        this.editForm = res.data.cmarketingRecord
        this.editDialogVisible = true;
      },
      // 点击按钮，修改营销记录
      editMarkRecord() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加营销记录的网络请求
          const {data: res} = await this.$http.post('markRecord/updateMarkRecord', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error('修改营销记录数据失败！')
          }
          this.$message.success('修改营销记录数据成功！')
          // 隐藏修改营销记录的对话框
          this.editDialogVisible = false
          // 重新获取营销记录列表数据
          this.getMarkRecordList()
          this.reload()
        })
      },
      //点击按钮，删除单个营销记录
      async deleteMarkRecordById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该营销记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('markRecord/delMarkRecord/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除营销记录失败！')
        }
        this.$message.success('删除营销记录成功！')
        this.getMarkRecordList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除营销记录
      async delMarkRecords() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除营销记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('markRecord/delMarkRecords/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除营销记录数据失败！')
        }
        this.$message.success('删除营销记录数据成功！')
        this.getMarkRecordList()
        this.reload()
      },
      async getCReportFile(item) {
        //console.log(item.file)
        await this.upload(item.file, this.addForm.cId).then(res1 => {
            if (res1.data.status !== 200) {
              this.addDialogVisible = false
              return this.$message.error('上传文件失败！')
            }
            this.addForm.cReport = res1.data.data.filename
            this.editForm.cReport = res1.data.data.filename
          }
        );
      },
      async getCTestimonialsFile(item) {
        //console.log(item.file)
        await this.upload(item.file, this.addForm.cId).then(res2 => {
            if (res2.data.status !== 200) {
              this.addDialogVisible = false
              return this.$message.error('上传文件失败！')
            }
            this.addForm.cTestimonials = res2.data.data.filename
            this.editForm.cTestimonials = res2.data.data.filename
          }
        );
      },
      async getCEvaluationFile(item) {
        //console.log(item.file)
        await this.upload(item.file, this.addForm.cId).then(res3 => {
            if (res3.data.status !== 200) {
              this.addDialogVisible = false
              return this.$message.error('上传文件失败！')
            }
            this.addForm.cEvaluation = res3.data.data.filename
            this.editForm.cEvaluation = res3.data.data.filename
          }
        );
      },
      async upload(file, cid) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('cid', cid)
        return await this.$http.post('markRecord/upload', formData)
      },
      bindCId(id) {
        this.addForm.cId = id
      },
      removeCReport() {
        this.addForm.cReport = ''
        this.editForm.cReport = ''
      },
      removeCTestimonials() {
        this.addForm.cTestimonials = ''
        this.editForm.cTestimonials = ''
      },
      removeCEvaluation() {
        this.addForm.cEvaluation = ''
        this.editForm.cEvaluation = ''
      },

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

  .home-container {
    height: 100%;
  }

  .el-table {
    max-height: 410px;
    overflow: auto;
  }
</style>
