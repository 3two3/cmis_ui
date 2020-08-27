<template>
  <div class="cmltr">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息辅助维护</el-breadcrumb-item>
      <el-breadcrumb-item>学习培训记录</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="10">
          <el-button type="danger" @click="delCmltrs()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加学习培训记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCmltrList"
            @change="getCmltrList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            style="width: 180px"
            v-model="queryInfo.cmTdate"
            @clear="getCmltrList"
            @change="getCmltrList"
            placeholder="请选择学习培训时间" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-select v-model="queryInfo.cmSub" placeholder="请选择培训科目" style="width: 180px" clearable
                     @change="getCmltrList"
                     @clear="getCmltrList">
            <el-option
              v-for="item in this.cmSubs"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCmltrList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 学习培训记录列表区域 -->
      <el-table :data="cmltrList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cmRemarks"></el-table-column>
        <el-table-column label="培训时间" prop="cmTdate"></el-table-column>
        <el-table-column label="科目" prop="cmSub"></el-table-column>
        <el-table-column label="培训单位" prop="cmTunit"></el-table-column>
        <el-table-column label="开始日期" prop="cmStartdate"></el-table-column>
        <el-table-column label="结束日期" prop="cmEnddate"></el-table-column>
        <el-table-column label="学时" prop="cmKnow"></el-table-column>
        <el-table-column label="学分" prop="cmCredit"></el-table-column>
        <el-table-column label="成绩" prop="cmScore"></el-table-column>
        <el-table-column label="附件依据" prop="cmAttachment">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/cmltr/'+scope.row.cmId+'/'+scope.row.cmAttachment"
               :download="scope.row.cmAttachment">
              {{scope.row.cmAttachment}}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="维护日期" prop="cmModificationDate"></el-table-column>
        <el-table-column label="维护人" prop="cmModificationPerson"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cmKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="delCmltrById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加学习培训记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="添加学习培训记录" :visible.sync="addDialogVisible" width="45%"
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
          <el-form-item label="培训时间：" prop="cmTdate">
            <el-date-picker type="date" placeholder="选择培训时间" v-model="addForm.cmTdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="培训科目：" prop="cmSub">
            <el-select clearable v-model="addForm.cmSub" placeholder="请选择培训科目">
              <el-option
                v-for="item in this.cmSubs"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="培训单位：" prop="cmTunit">
            <el-input v-model="addForm.cmTunit" placeholder="请输入培训单位"></el-input>
          </el-form-item>
          <el-form-item label="开始时间：" prop="cmStartdate">
            <el-date-picker type="date" placeholder="选择开始时间" v-model="addForm.cmStartdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间：" prop="cmEnddate">
            <el-date-picker type="date" placeholder="选择结束时间" v-model="addForm.cmEnddate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="学时：" prop="cmKnow">
            <el-input v-model.number="addForm.cmKnow" placeholder="请输入学时"></el-input>
          </el-form-item>
          <el-form-item label="学分：" prop="cmCredit">
            <el-input v-model.number="addForm.cmCredit" placeholder="请输入学分"></el-input>
          </el-form-item>
          <el-form-item label="成绩：" prop="cmScore">
            <el-input v-model.number="addForm.cmScore" placeholder="请输入成绩"></el-input>
          </el-form-item>
          <el-form-item label="附件依据：" prop="cmAttachment">
            <el-upload
              :on-remove="removeCmAttachment"
              ref="addCmAttachmentRef"
              action="#"
              :limit="1"
              :http-request="getCmAttachmentFile">
              <el-button size="small" type="success">选择附件依据</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCmltr">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改学习培训记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="修改学习培训记录" :visible.sync="editDialogVisible" width="45%"
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
          <el-form-item label="培训时间：" prop="cmTdate">
            <el-date-picker type="date" placeholder="选择培训时间" v-model="editForm.cmTdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="培训科目：" prop="cmSub">
            <el-select clearable v-model="editForm.cmSub" placeholder="请选择培训科目">
              <el-option
                v-for="item in this.cmSubs"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="培训单位：" prop="cmTunit">
            <el-input v-model="editForm.cmTunit" placeholder="请输入培训单位"></el-input>
          </el-form-item>
          <el-form-item label="开始时间：" prop="cmStartdate">
            <el-date-picker type="date" placeholder="选择开始时间" v-model="editForm.cmStartdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间：" prop="cmEnddate">
            <el-date-picker type="date" placeholder="选择结束时间" v-model="editForm.cmEnddate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="学时：" prop="cmKnow">
            <el-input v-model.number="editForm.cmKnow" placeholder="请输入学时"></el-input>
          </el-form-item>
          <el-form-item label="学分：" prop="cmCredit">
            <el-input v-model.number="editForm.cmCredit" placeholder="请输入学分"></el-input>
          </el-form-item>
          <el-form-item label="成绩：" prop="cmScore">
            <el-input v-model.number="editForm.cmScore" placeholder="请输入成绩"></el-input>
          </el-form-item>
          <el-form-item label="附件依据：" prop="cmAttachment">
            <el-upload
              :on-remove="removeCmAttachment"
              ref="addCmAttachmentRef"
              action="#"
              :limit="1"
              :http-request="getCmAttachmentFile">
              <el-button size="small" type="success">选择附件依据</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCmltr">确 定</el-button>
        </span>
      </el-dialog>


    </el-card>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      //验证数字范围
      var checkNumSize = (rule, value, cb) => {
        if (value < 0 || value > 100) {
          cb(new Error('时间年限应在0-100之间'))
        } else {
          cb()
        }
      }
      return {
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取学习培训记录列表的参数对象
        queryInfo: {
          //查询经理编号
          cmId: '',
          //查询学习培训时间
          cmTdate: '',
          //查询科目
          cmTunit: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //所有证照数据
        cmltrList: [],
        //所有客户经理
        cminfos: [],
        //所有学习培训结果数据
        cmSubs: [],
        //学习培训记录总数
        total: 0,
        // 控制添加学习培训记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改学习培训记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加学习培训记录的表单数据
        addForm: {
          cmId: '',
          cmTdate: '',
          cmSub: '',
          cmTunit: '',
          cmStartdate: '',
          cmEnddate: '',
          cmKnow: '',
          cmCredit: '',
          cmScore: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmTdate: [
            {required: true, message: '请选择培训时间', trigger: ['blur', 'change']}
          ],
          cmSub: [
            {required: true, message: '请选择培训科目', trigger: ['blur', 'change']}
          ],
          cmTunit: [
            {required: true, message: '请输入培训单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '培训单位的长度在1~20个字符之间', trigger: 'blur'}
          ],
          cmStartdate: [
            {required: true, message: '请选择开始时间', trigger: ['blur', 'change']}
          ],
          cmEnddate: [
            {required: true, message: '请选择结束时间', trigger: ['blur', 'change']}
          ],
          cmKnow: [
            {required: true, message: '请输入培训学时', trigger: ['blur', 'change']},
            {type: 'number', message: '培训学时请输入数字', trigger: ['blur', 'change']},
          ],
          cmCredit: [
            {required: true, message: '请输入培训学分', trigger: ['blur', 'change']},
            {type: 'number', message: '培训学分请输入数字', trigger: ['blur', 'change']},
          ],
          cmScore: [
            {required: true, message: '请输入培训成绩', trigger: ['blur', 'change']},
            {type: 'number', message: '培训成绩请输入数字', trigger: ['blur', 'change']},
            {validator: checkNumSize, trigger: 'blur'}
          ],
        },
        // 修改学习培训记录的表单数据
        editForm: {
          cmKey: '',
          cmId: '',
          cmTdate: '',
          cmSub: '',
          cmTunit: '',
          cmStartdate: '',
          cmEnddate: '',
          cmKnow: '',
          cmCredit: '',
          cmScore: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmTdate: [
            {required: true, message: '请选择培训时间', trigger: ['blur', 'change']}
          ],
          cmSub: [
            {required: true, message: '请选择培训科目', trigger: ['blur', 'change']}
          ],
          cmTunit: [
            {required: true, message: '请输入培训单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '培训单位的长度在1~20个字符之间', trigger: 'blur'}
          ],
          cmStartdate: [
            {required: true, message: '请选择开始时间', trigger: ['blur', 'change']}
          ],
          cmEnddate: [
            {required: true, message: '请选择结束时间', trigger: ['blur', 'change']}
          ],
          cmKnow: [
            {required: true, message: '请输入培训学时', trigger: ['blur', 'change']},
            {type: 'number', message: '培训学时请输入数字', trigger: ['blur', 'change']},
          ],
          cmCredit: [
            {required: true, message: '请输入培训学分', trigger: ['blur', 'change']},
            {type: 'number', message: '培训学分请输入数字', trigger: ['blur', 'change']},
          ],
          cmScore: [
            {required: true, message: '请输入培训成绩', trigger: ['blur', 'change']},
            {type: 'number', message: '培训成绩请输入数字', trigger: ['blur', 'change']},
            {validator: checkNumSize, trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.getCmltrList()
    },
    methods: {
      //获取学习培训记录列表
      async getCmltrList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cmltr/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取学习培训记录列表失败！')
        }
        this.cmltrList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.cminfos = res.data.cminfos
        this.cmSubs = res.data.cmSubs
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCmltrList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCmltrList()
      },
      // 监听添加学习培训记录对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.$refs.addCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 监听修改学习培训记录对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.$refs.editCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 点击按钮，添加新学习培训记录
      addCmltr() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加学习培训记录的网络请求
          //console.log(this.addForm.dictPerms)
          const {data: res} = await this.$http.post('cmltr/addCmltr', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加学习培训记录成功！')
          // 隐藏添加学习培训记录的对话框
          this.addDialogVisible = false
          // 重新获取学习培训记录列表数据
          this.getCmltrList()
          //this.reload()
        })
      },
      //监听修改学习培训记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cmltr/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询学习培训记录信息失败！')
        }
        this.editForm = res.data.cmltr
        this.editForm.cmPeriod = this.editForm.cmPeriod == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改学习培训记录
      editCmltr() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加学习培训记录的网络请求
          const {data: res} = await this.$http.post('cmltr/updateCmltr', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改学习培训记录数据成功！')
          // 隐藏修改学习培训记录的对话框
          this.editDialogVisible = false
          // 重新获取学习培训记录列表数据
          this.getCmltrList()
          //this.reload()
        })
      },
      //点击按钮，删除单个学习培训记录
      async delCmltrById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该学习培训记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmltr/delCmltr/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除学习培训记录失败！')
        }
        this.$message.success('删除学习培训记录成功！')
        this.getCmltrList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除学习培训记录
      async delCmltrs() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除学习培训记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmltr/delCmltrs/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除学习培训记录数据失败！')
        }
        this.$message.success('删除学习培训记录数据成功！')
        this.getCmltrList()
        //this.reload()
      },
      bindCmName(cmName) {
        this.addForm.cmRemarks = cmName
        this.editForm.cmRemarks = cmName
      },
      async getCmAttachmentFile(item) {
        if (this.addDialogVisible) {
          //console.log(item.file)
          await this.upload(item.file, this.addForm.cmId).then(res => {
              if (res.data.status !== 200) {
                this.addDialogVisible = false
                return this.$message.error('上传文件失败！')
              }
              this.addForm.cmAttachment = res.data.data.filename
            }
          );
        }
        if (this.editDialogVisible) {
          //console.log(item.file)
          await this.upload(item.file, this.editForm.cmId).then(res => {
              if (res.data.status !== 200) {
                this.editDialogVisible = false
                return this.$message.error('上传文件失败！')
              }
              this.editForm.cmAttachment = res.data.data.filename
            }
          );
        }
      },
      async upload(file, cmId) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('cmId', cmId)
        return await this.$http.post('cmltr/upload', formData)
      },
      removeCmAttachment() {
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
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

  .el-table {
    max-height: 410px;
    overflow: auto;
  }
</style>
