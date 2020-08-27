<template>
  <div class="cmass">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息辅助维护</el-breadcrumb-item>
      <el-breadcrumb-item>考核记录</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="14">
          <el-button type="danger" @click="delCmasss()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加考核记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCmassList"
            @change="getCmassList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            style="width: 180px"
            v-model="queryInfo.cmAsstime"
            @clear="getCmassList"
            @change="getCmassList"
            placeholder="请选择考核时间" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCmassList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 考核记录列表区域 -->
      <el-table :data="cmassList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cmRemarks"></el-table-column>
        <el-table-column label="考核时间" prop="cmAsstime"></el-table-column>
        <el-table-column label="考核内容" prop="cmAssub"></el-table-column>
        <el-table-column label="考核结果" prop="cmAssresult"></el-table-column>
        <el-table-column label="考核评价" prop="cmAppraisal"></el-table-column>
        <el-table-column label="考核单位" prop="cmAssunit"></el-table-column>
        <el-table-column label="附件依据" prop="cmAttachment">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/cmass/'+scope.row.cmId+'/'+scope.row.cmAttachment"
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
                       @click="delCmassById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加考核记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="添加考核记录" :visible.sync="addDialogVisible" width="45%"
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
          <el-form-item label="考核时间：" prop="cmAsstime">
            <el-date-picker type="date" placeholder="选择考核时间" v-model="addForm.cmAsstime"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="考核内容：" prop="cmAssub">
            <el-input type="textarea" v-model="addForm.cmAssub" placeholder="请输入考核内容"></el-input>
          </el-form-item>
          <el-form-item label="考核结果：" prop="cmAssresult">
            <el-select clearable v-model="addForm.cmAssresult" placeholder="请选择考核结果">
              <el-option
                v-for="item in this.cmAssresults"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="考核评价：" prop="cmAppraisal">
            <el-input type="textarea" v-model="addForm.cmAppraisal" placeholder="请输入考核评价"></el-input>
          </el-form-item>
          <el-form-item label="考核单位：" prop="cmAssunit">
            <el-input v-model="addForm.cmAssunit" placeholder="请输入考核单位"></el-input>
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
          <el-button type="primary" @click="addCmass">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改考核记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="修改考核记录" :visible.sync="editDialogVisible" width="45%"
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
          <el-form-item label="考核时间：" prop="cmAsstime">
            <el-date-picker type="date" placeholder="选择考核时间" v-model="editForm.cmAsstime"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="考核内容：" prop="cmAssub">
            <el-input type="textarea" v-model="editForm.cmAssub" placeholder="请输入考核内容"></el-input>
          </el-form-item>
          <el-form-item label="考核结果：" prop="cmAssresult">
            <el-select clearable v-model="editForm.cmAssresult" placeholder="请选择考核结果">
              <el-option
                v-for="item in this.cmAssresults"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="考核评价：" prop="cmAppraisal">
            <el-input type="textarea" v-model="editForm.cmAppraisal" placeholder="请输入考核评价"></el-input>
          </el-form-item>
          <el-form-item label="考核单位：" prop="cmAssunit">
            <el-input v-model="editForm.cmAssunit" placeholder="请输入考核单位"></el-input>
          </el-form-item>
          <el-form-item label="附件依据：" prop="cmAttachment">
            <el-upload
              :on-remove="removeCmAttachment"
              ref="editCmAttachmentRef"
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
          <el-button type="primary" @click="editCmass">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
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
        // 获取考核记录列表的参数对象
        queryInfo: {
          //查询经理编号
          cmId: '',
          //查询考核时间
          cmAsstime: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //所有证照数据
        cmassList: [],
        //所有客户经理
        cminfos: [],
        //所有考核结果数据
        cmAssresults: [],
        //考核记录总数
        total: 0,
        // 控制添加考核记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改考核记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加考核记录的表单数据
        addForm: {
          cmId: '',
          cmAsstime: '',
          cmAssub: '',
          cmAssresult: '',
          cmAppraisal: '',
          cmAssunit: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmAsstime: [
            {required: true, message: '请选择考核时间', trigger: ['blur', 'change']}
          ],
          cmAssub: [
            {required: true, message: '请输入考核内容', trigger: ['blur', 'change']},
            {min: 1, max: 100, message: '考核内容的长度在1~100个字符之间', trigger: 'blur'}
          ],
          cmAssresult: [
            {required: true, message: '请选择考核结果', trigger: ['blur', 'change']},
          ],
          cmAppraisal: [
            {required: true, message: '请输入考核评价', trigger: ['blur', 'change']},
            {min: 1, max: 50, message: '考核评价的长度在1~50个字符之间', trigger: 'blur'}
          ],
          cmAssunit: [
            {required: true, message: '请输入考核单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '考核单位的长度在1~20个字符之间', trigger: 'blur'}
          ],
        },
        // 修改考核记录的表单数据
        editForm: {
          cmKey: '',
          cmId: '',
          cmAsstime: '',
          cmAssub: '',
          cmAssresult: '',
          cmAppraisal: '',
          cmAssunit: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmAsstime: [
            {required: true, message: '请选择考核时间', trigger: ['blur', 'change']}
          ],
          cmAssub: [
            {required: true, message: '请输入考核内容', trigger: ['blur', 'change']},
            {min: 1, max: 100, message: '考核内容的长度在1~100个字符之间', trigger: 'blur'}
          ],
          cmAssresult: [
            {required: true, message: '请选择考核结果', trigger: ['blur', 'change']},
          ],
          cmAppraisal: [
            {required: true, message: '请输入考核评价', trigger: ['blur', 'change']},
            {min: 1, max: 50, message: '考核评价的长度在1~50个字符之间', trigger: 'blur'}
          ],
          cmAssunit: [
            {required: true, message: '请输入考核单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '考核单位的长度在1~20个字符之间', trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.getCmassList()
    },
    methods: {
      //获取考核记录列表
      async getCmassList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cmass/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取考核记录列表失败！')
        }
        this.cmassList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.cminfos = res.data.cminfos
        this.cmAssresults = res.data.cmAssresults
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCmassList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCmassList()
      },
      // 监听添加考核记录对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.$refs.addCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 监听修改考核记录对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.$refs.editCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 点击按钮，添加新考核记录
      addCmass() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加考核记录的网络请求
          //console.log(this.addForm.dictPerms)
          const {data: res} = await this.$http.post('cmass/addCmass', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加考核记录成功！')
          // 隐藏添加考核记录的对话框
          this.addDialogVisible = false
          // 重新获取考核记录列表数据
          this.getCmassList()
          //this.reload()
        })
      },
      //监听修改考核记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cmass/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询考核记录信息失败！')
        }
        this.editForm = res.data.cmass
        this.editForm.cmPeriod = this.editForm.cmPeriod == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改考核记录
      editCmass() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加考核记录的网络请求
          const {data: res} = await this.$http.post('cmass/updateCmass', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改考核记录数据成功！')
          // 隐藏修改考核记录的对话框
          this.editDialogVisible = false
          // 重新获取考核记录列表数据
          this.getCmassList()
          //this.reload()
        })
      },
      //点击按钮，删除单个考核记录
      async delCmassById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该考核记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmass/delCmass/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除考核记录失败！')
        }
        this.$message.success('删除考核记录成功！')
        this.getCmassList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除考核记录
      async delCmasss() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除考核记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmass/delCmasss/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除考核记录数据失败！')
        }
        this.$message.success('删除考核记录数据成功！')
        this.getCmassList()
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
        return await this.$http.post('cmass/upload', formData)
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
