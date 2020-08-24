<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>学习园地管理</el-breadcrumb-item>
      <el-breadcrumb-item>学习园地管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="13">
          <el-button type="danger" @click="delCLearns()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加学习资料</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入名称"
            v-model="queryInfo.lName"
            clearable
            @clear="getCLearnList"
            @change="getCLearnList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="queryInfo.lType" placeholder="请选择类型" clearable
                     @clear="getCLearnList"
                     @change="getCLearnList">
            <el-option
              v-for="item in this.types"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCLearnList">搜索</el-button>
        </el-col>
      </el-row>
      <!-- 学习资料列表区域 -->
      <el-table :data="cLearnList" row-key="lKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="名称" prop="lName"></el-table-column>
        <el-table-column label="类型" prop="lType"></el-table-column>
        <el-table-column label="描述" prop="lDes"></el-table-column>
        <el-table-column label="上传时间" prop="lDate"></el-table-column>
        <el-table-column label="下载">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/cLearn/'+scope.row.lUper+'/'+scope.row.lUrl"
               :download="scope.row.lUrl">
              {{scope.row.lUrl}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="上传人" prop="lUper"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.lKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="delCLearnById(scope.row.lKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加学习资料的对话框 -->
    <el-dialog title="添加学习资料" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="资料名称：" prop="lName">
          <el-input v-model="addForm.lName" placeholder="请输入资料名称"></el-input>
        </el-form-item>
        <el-form-item label="资料类型：" prop="lType">
          <el-select v-model="addForm.lType" placeholder="请选择资料类型">
            <el-option
              v-for="item in this.types"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资料描述：" prop="lDes">
          <el-input type="textarea" v-model="addForm.lDes"></el-input>
        </el-form-item>
        <el-form-item label="附件上传：" prop="lUrl">
          <el-upload
            :on-remove="removelUrl"
            ref="addlUrlRef"
            action="#"
            :limit="1"
            :http-request="getlUrlFile">
            <el-button size="small" type="success">选择附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCLearn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改学习资料的对话框 -->
    <el-dialog title="修改学习资料" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px">
        <el-form-item label="资料名称：" prop="lName">
          <el-input v-model="editForm.lName" placeholder="请输入资料名称"></el-input>
        </el-form-item>
        <el-form-item label="资料类型：" prop="lType">
          <el-select v-model="editForm.lType" placeholder="请选择资料类型">
            <el-option
              v-for="item in this.types"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资料描述：" prop="lDes">
          <el-input type="textarea" v-model="editForm.lDes"></el-input>
        </el-form-item>
        <el-form-item label="附件上传：" prop="lUrl">
          <el-upload
            :on-remove="removelUrl"
            ref="editlUrlRef"
            action="#"
            :limit="1"
            :http-request="getlUrlFile">
            <el-button size="small" type="success">选择附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCLearn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      return {
        //资料类型
        types: [],
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取学习资料列表的参数对象
        queryInfo: {
          //名称
          lName: '',
          //类型
          lType: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //学习资料列表
        cLearnList: [],
        //学习资料总数
        total: 0,
        // 控制添加学习资料对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改学习资料对话框的显示与隐藏
        editDialogVisible: false,
        // 添加学习资料的表单数据
        addForm: {
          lName: '',
          lType: '',
          lDes: '',
          lUrl: '',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          lName: [
            {required: true, message: '请输入资料名称', trigger: 'blur'},
            {min: 2, max: 20, message: '资料名称的长度在2~20个字符之间', trigger: 'blur'}
          ],
          lType: [
            {required: true, message: '请选择资料类型', trigger: ['blur', 'change']}
          ],
          lDes: [
            {required: true, message: '请输入资料描述', trigger: ['blur', 'change']},
            {min: 2, max: 255, message: '资料描述的长度在2~255个字符之间', trigger: 'blur'}
          ],
          /*lUrl: [
            {required: true, message: '请选择附件', trigger: ['blur', 'change']}
          ],*/
        },
        // 修改学习资料的表单数据
        editForm: {
          lKey: '',
          lName: '',
          lType: '',
          lDes: '',
          lUrl: '',
        },
        //  修改表单的验证规则对象
        editFormRules: {
          lName: [
            {required: true, message: '请输入资料名称', trigger: 'blur'},
            {min: 2, max: 20, message: '资料名称的长度在2~20个字符之间', trigger: 'blur'}
          ],
          lType: [
            {required: true, message: '请选择资料类型', trigger: ['blur', 'change']}
          ],
          lDes: [
            {required: true, message: '请输入资料描述', trigger: ['blur', 'change']},
            {min: 2, max: 255, message: '资料描述的长度在2~255个字符之间', trigger: 'blur'}
          ],
          /*lUrl: [
            {required: true, message: '请选择附件', trigger: ['blur', 'change']}
          ],*/
        }
      }
    },
    created() {
      this.getCLearnList()
    },
    methods: {
      //获取学习资料列表
      async getCLearnList() {
        const {data: res} = await this.$http.get('cLearn/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取学习资料列表失败！')
        }
        this.cLearnList = res.data.pageInfo.list
        this.types = res.data.types
        this.total = res.data.pageInfo.total
        this.loading = false
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCLearnList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCLearnList()
      },
      // 监听添加学习资料对话框的关闭事件
      addDialogClosed() {
        this.$refs['addFormRef'].resetFields()
        this.$refs['addlUrlRef'].clearFiles()
        Object.assign(this.$data.addForm, this.$options.data().addForm)
      },
      // 监听修改学习资料对话框的关闭事件
      editDialogClosed() {
        this.$refs['editFormRef'].resetFields()
        this.$refs['editlUrlRef'].clearFiles()
        Object.assign(this.$data.editForm, this.$options.data().editForm)
      },
      // 点击按钮，添加新学习资料
      addCLearn() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加学习资料的网络请求
          //console.log(this.addForm)
          //console.log(this.participants.toString())
          const {data: res} = await this.$http.post('cLearn/addCLearn', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error('添加学习资料失败！')
          }
          this.$message.success('添加学习资料成功！')
          // 隐藏添加学习资料的对话框
          this.addDialogVisible = false
          // 重新获取学习资料列表数据
          this.getCLearnList()
          this.reload()
        })
      },
      //监听修改学习资料的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cLearn/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询学习资料信息失败！')
        }
        this.editForm = res.data.cLearn
        this.editDialogVisible = true;
      },
      // 点击按钮，修改学习资料
      editCLearn() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加学习资料的网络请求
          const {data: res} = await this.$http.post('cLearn/updateCLearn', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error('修改学习资料数据失败！')
          }
          this.$message.success('修改学习资料数据成功！')
          // 隐藏修改学习资料的对话框
          this.editDialogVisible = false
          // 重新获取学习资料列表数据
          this.getCLearnList()
          this.reload()
        })
      },
      //点击按钮，删除单个学习资料
      async delCLearnById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该学习资料, 是否继续?',
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
        const {data: result} = await this.$http.delete('cLearn/delCLearn/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除学习资料失败！')
        }
        this.$message.success('删除学习资料成功！')
        this.getCLearnList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除学习资料
      async delCLearns() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.lKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除学习资料数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cLearn/delCLearns/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除学习资料数据失败！')
        }
        this.$message.success('删除学习资料数据成功！')
        this.getCLearnList()
        this.reload()
      },
      async getlUrlFile(item) {
        //console.log(item.file)
        await this.upload(item.file).then(res1 => {
            if (res1.data.status !== 200) {
              this.addDialogVisible = false
              return this.$message.error('上传文件失败！')
            }
            this.addForm.lUrl = res1.data.data.filename
            this.editForm.lUrl = res1.data.data.filename
          }
        );
      },
      async upload(file) {
        const formData = new FormData()
        formData.append('file', file)
        return await this.$http.post('cLearn/upload', formData)
      },
      removelUrl() {
        this.addForm.lUrl = ''
        this.editForm.lUrl = ''
      }

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
