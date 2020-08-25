<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常工作管理</el-breadcrumb-item>
      <el-breadcrumb-item>例会管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="10">
          <el-button type="danger" @click="delCmregulars()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加例会记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCmRegularList"
            @change="getCmRegularList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker style="width: 180px;" clearable type="date" placeholder="选择日期"
                          v-model="queryInfo.cmRegularDate"
                          format="yyyy-MM-dd" value-format="yyyy-MM-dd" @clear="getCmRegularList"
                          @change="getCmRegularList"></el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入主题"
            v-model="queryInfo.cmRegularTheme"
            clearable
            @clear="getCmRegularList"
            @change="getCmRegularList">
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCmRegularList">搜索</el-button>
        </el-col>
      </el-row>
      <!-- 例会记录列表区域 -->
      <el-table :data="cmRegularList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="日期" prop="cmRegularDate"></el-table-column>
        <el-table-column label="主题" prop="cmRegularTheme"></el-table-column>
        <el-table-column label="与会人员" prop="cmRegularPersonnel"></el-table-column>
        <el-table-column label="附件">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/cmRegular/'+scope.row.cmId+'/'+scope.row.cmAttachment"
               :download="scope.row.cmAttachment">
              {{scope.row.cmAttachment}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cmKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="delCmregularById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加例会记录的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加例会记录" :visible.sync="addDialogVisible" width="45%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
        <el-form-item label="主题：" prop="cmRegularTheme">
          <el-input v-model="addForm.cmRegularTheme" placeholder="请输入例会主题"></el-input>
        </el-form-item>
        <el-form-item label="日期：" prop="cmRegularDate">
          <el-date-picker type="date" placeholder="选择例会时间" v-model="addForm.cmRegularDate"
                          format="yyyy-MM-dd" value-format="yyyy-MM-dd" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="与会人员：" prop="cManagement">
          <el-select v-model="participants" multiple placeholder="请选择与会人员">
            <el-option
              v-for="item in this.cminfos"
              :key="item.cmId"
              :label="item.cmName"
              :value="item.cmName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="附件：" prop="cmAttachment">
          <el-upload
            ref="addCmAttachmentRef"
            action="#"
            :limit="1"
            :http-request="getCmAttachmentFile">
            <el-button size="small" type="success">选择附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCmregular">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改例会记录的对话框 -->
    <el-dialog :close-on-click-modal="false" title="修改例会记录" :visible.sync="editDialogVisible" width="45%"
               @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
        <el-form-item label="主题：" prop="cmRegularTheme">
          <el-input v-model="editForm.cmRegularTheme" placeholder="请输入例会主题"></el-input>
        </el-form-item>
        <el-form-item label="日期：" prop="cmRegularDate">
          <el-date-picker type="date" placeholder="选择例会时间" v-model="editForm.cmRegularDate"
                          format="yyyy-MM-dd" value-format="yyyy-MM-dd" clearable></el-date-picker>
        </el-form-item>
        <el-form-item label="与会人员：" prop="cManagement">
          <el-select v-model="participants" multiple placeholder="请选择与会人员">
            <el-option
              v-for="item in this.cminfos"
              :key="item.cmId"
              :label="item.cmName"
              :value="item.cmName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="附件：" prop="cmAttachment">
          <el-upload
            ref="editCmAttachmentRef"
            action="#"
            :limit="1"
            :http-request="getCmAttachmentFile">
            <el-button size="small" type="success">选择附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCmregular">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      return {
        //与会人员
        participants: [],
        //客户经理列表信息
        cminfos: [],
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取例会记录列表的参数对象
        queryInfo: {
          //查询客户经理编号
          cmId: '',
          //查询日期
          cmRegularDate: '',
          //查询主题
          cmRegularTheme: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //例会记录列表
        cmRegularList: [],
        //例会记录总数
        total: 0,
        // 控制添加例会记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改例会记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加例会记录的表单数据
        addForm: {
          cmRegularTheme: '',
          cmRegularDate: '',
          cmRegularPersonnel: '',
          cmAttachment: '',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmRegularTheme: [
            {required: true, message: '请输入例会主题', trigger: 'blur'},
            {min: 2, max: 20, message: '例会主题的长度在2~20个字符之间', trigger: 'blur'}
          ],
          cmRegularDate: [
            {required: true, message: '请选择例会时间', trigger: ['blur', 'change']}
          ],
          cmRegularPersonnel: [
            {required: true, message: '请选择与会人员', trigger: ['blur', 'change']}
          ],
        },
        // 修改例会记录的表单数据
        editForm: {
          cmKey: '',
          cmRegularTheme: '',
          cmRegularDate: '',
          cmRegularPersonnel: '',
          cmAttachment: '',
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmRegularTheme: [
            {required: true, message: '请输入例会主题', trigger: 'blur'},
            {min: 2, max: 20, message: '例会主题的长度在2~20个字符之间', trigger: 'blur'}
          ],
          cmRegularDate: [
            {required: true, message: '请选择例会时间', trigger: ['blur', 'change']}
          ],
          cmRegularPersonnel: [
            {required: true, message: '请选择与会人员', trigger: ['blur', 'change']}
          ],
        }
      }
    },
    created() {
      this.getCmRegularList()
    },
    methods: {
      //获取例会记录列表
      async getCmRegularList() {
        const {data: res} = await this.$http.get('regular/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取例会记录列表失败！')
        }
        this.cmRegularList = res.data.pageInfo.list
        this.cminfos = res.data.cminfos
        this.total = res.data.pageInfo.total
        this.loading = false
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCmRegularList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCmRegularList()
      },
      // 监听添加例会记录对话框的关闭事件
      addDialogClosed() {
        this.$refs['addFormRef'].resetFields()
        this.$refs['addCmAttachmentRef'].clearFiles()
        this.participants = []
        Object.assign(this.$data.addForm, this.$options.data().addForm)
      },
      // 监听修改例会记录对话框的关闭事件
      editDialogClosed() {
        this.$refs['editFormRef'].resetFields()
        this.$refs['editCmAttachmentRef'].clearFiles()
        this.participants = []
        Object.assign(this.$data.editForm, this.$options.data().editForm)
      },
      // 点击按钮，添加新例会记录
      addCmregular() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加例会记录的网络请求
          // console.log(this.addForm)
          //console.log(this.participants.toString())
          this.addForm.cmRegularPersonnel = this.participants.toString()
          const {data: res} = await this.$http.post('regular/addCmregular', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error('添加例会记录失败！')
          }
          this.$message.success('添加例会记录成功！')
          // 隐藏添加例会记录的对话框
          this.addDialogVisible = false
          // 重新获取例会记录列表数据
          this.getCmRegularList()
          this.reload()
        })
      },
      //监听修改例会记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('regular/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询例会记录信息失败！')
        }
        this.editForm = res.data.cmregular
        this.participants = res.data.cmregular.cmRegularPersonnel.split(',')
        this.editDialogVisible = true;
      },
      // 点击按钮，修改例会记录
      editCmregular() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加例会记录的网络请求
          this.editForm.cmRegularPersonnel = this.participants.toString()
          const {data: res} = await this.$http.post('regular/updateCmregular', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error('修改例会记录数据失败！')
          }
          this.$message.success('修改例会记录数据成功！')
          // 隐藏修改例会记录的对话框
          this.editDialogVisible = false
          // 重新获取例会记录列表数据
          this.getCmRegularList()
          this.reload()
        })
      },
      //点击按钮，删除单个例会记录
      async delCmregularById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该例会记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('regular/delCmregular/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除例会记录失败！')
        }
        this.$message.success('删除例会记录成功！')
        this.getCmRegularList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除例会记录
      async delCmregulars() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除例会记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('regular/delCmregulars/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除例会记录数据失败！')
        }
        this.$message.success('删除例会记录数据成功！')
        this.getCmRegularList()
        this.reload()
      },
      async getCmAttachmentFile(item) {
        //console.log(item.file)
        await this.upload(item.file).then(res1 => {
            if (res1.data.status !== 200) {
              this.addDialogVisible = false
              return this.$message.error('上传文件失败！')
            }
            this.addForm.cmAttachment = res1.data.data.filename
            this.editForm.cmAttachment = res1.data.data.filename
          }
        );
      },
      async upload(file) {
        const formData = new FormData()
        formData.append('file', file)
        return await this.$http.post('regular/upload', formData)
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
