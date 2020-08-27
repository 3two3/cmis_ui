<template>
  <div class="cmrpr">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息辅助维护</el-breadcrumb-item>
      <el-breadcrumb-item>奖惩记录</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="14">
          <el-button type="danger" @click="delCmrprs()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加奖惩记录</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCmrprList"
            @change="getCmrprList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select clearable v-model="queryInfo.cmTpye" placeholder="请选择奖惩类型">
            <el-option
              v-for="item in this.cmTpyes"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName"
              clearable
              @clear="getCmrprList"
              @change="getCmrprList">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCmrprList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 奖惩记录列表区域 -->
      <el-table :data="cmrprList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cmRemarks"></el-table-column>
        <el-table-column label="奖惩分类" prop="cmTpye"></el-table-column>
        <el-table-column label="奖惩内容" prop="cmSub"></el-table-column>
        <el-table-column label="生效日期" prop="cmDate"></el-table-column>
        <el-table-column label="审批单位" prop="cmAunit"></el-table-column>
        <el-table-column label="审批人" prop="cmAperson"></el-table-column>
        <el-table-column label="撤销日期" prop="cmRdate"></el-table-column>
        <el-table-column label="撤销原因" prop="cmAreason"></el-table-column>
        <el-table-column label="附件依据" prop="cmAttachment">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/cmrpr/'+scope.row.cmId+'/'+scope.row.cmAttachment"
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
                       @click="delCmrprById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加奖惩记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="添加奖惩记录" :visible.sync="addDialogVisible" width="45%"
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
          <el-form-item label="奖惩分类：" prop="cmTpye">
            <el-select clearable v-model="addForm.cmTpye" placeholder="请选择奖惩分类">
              <el-option
                v-for="item in this.cmTpyes"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="奖惩内容：" prop="cmSub">
            <el-input v-model="addForm.cmSub" placeholder="请输入奖惩内容"></el-input>
          </el-form-item>
          <el-form-item label="生效日期：" prop="cmDate">
            <el-date-picker type="date" placeholder="选择生效日期" v-model="addForm.cmDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="审批单位：" prop="cmAunit">
            <el-input v-model="addForm.cmAunit" placeholder="请输入审批单位"></el-input>
          </el-form-item>
          <el-form-item label="撤销日期：" prop="cmRdate">
            <el-date-picker type="date" placeholder="选择撤销日期" v-model="addForm.cmRdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="撤销原因：" prop="cmAreason">
            <el-input v-model="addForm.cmAreason" placeholder="请输入撤销原因"></el-input>
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
        <el-button type="primary" @click="addCmrpr">确 定</el-button>
      </span>
      </el-dialog>

      <!-- 修改奖惩记录的对话框 -->
      <el-dialog :close-on-click-modal="false" title="修改奖惩记录" :visible.sync="editDialogVisible" width="45%"
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
          <el-form-item label="奖惩分类：" prop="cmTpye">
            <el-select clearable v-model="editForm.cmTpye" placeholder="请选择奖惩分类">
              <el-option
                v-for="item in this.cmTpyes"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="奖惩内容：" prop="cmSub">
            <el-input v-model="editForm.cmSub" placeholder="请输入奖惩内容"></el-input>
          </el-form-item>
          <el-form-item label="生效日期：" prop="cmDate">
            <el-date-picker type="date" placeholder="选择生效日期" v-model="editForm.cmDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="审批单位：" prop="cmAunit">
            <el-input v-model="editForm.cmAunit" placeholder="请输入审批单位"></el-input>
          </el-form-item>
          <el-form-item label="撤销日期：" prop="cmRdate">
            <el-date-picker type="date" placeholder="选择撤销日期" v-model="editForm.cmRdate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="撤销原因：" prop="cmAreason">
            <el-input v-model="editForm.cmAreason" placeholder="请输入撤销原因"></el-input>
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
        <el-button type="primary" @click="editCmrpr">确 定</el-button>
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
        // 获取奖惩记录列表的参数对象
        queryInfo: {
          //查询经理编号
          cmId: '',
          //查询奖惩类型
          cmTpye: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //所有证照数据
        cmrprList: [],
        //所有客户经理
        cminfos: [],
        //所有奖惩类型数据
        cmTpyes: [],
        //奖惩记录总数
        total: 0,
        // 控制添加奖惩记录对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改奖惩记录对话框的显示与隐藏
        editDialogVisible: false,
        // 添加奖惩记录的表单数据
        addForm: {
          cmId: '',
          cmTpye: '',
          cmSub: '',
          cmDate: '',
          cmAunit: '',
          cmRdate: '',
          cmAreason: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmTpye: [
            {required: true, message: '请选择奖惩类型', trigger: ['blur', 'change']}
          ],
          cmSub: [
            {required: true, message: '请输入奖惩内容', trigger: ['blur', 'change']},
            {min: 1, max: 50, message: '奖惩内容的长度在1~50个字符之间', trigger: 'blur'}
          ],
          cmDate: [
            {required: true, message: '请选择生效日期', trigger: ['blur', 'change']},
          ],
          cmEndDate: [
            {required: true, message: '请选择失效时间', trigger: ['blur', 'change']},
          ],
          cmAunit: [
            {required: true, message: '请输入审批单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '审批单位的长度在1~20个字符之间', trigger: 'blur'}
          ],
        },
        // 修改奖惩记录的表单数据
        editForm: {
          cmKey: '',
          cmId: '',
          cmTpye: '',
          cmSub: '',
          cmDate: '',
          cmAunit: '',
          cmRdate: '',
          cmAreason: '',
          cmAttachment: '',
          cmRemarks: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmTpye: [
            {required: true, message: '请选择奖惩类型', trigger: ['blur', 'change']}
          ],
          cmSub: [
            {required: true, message: '请输入奖惩内容', trigger: ['blur', 'change']},
            {min: 1, max: 50, message: '奖惩内容的长度在1~50个字符之间', trigger: 'blur'}
          ],
          cmDate: [
            {required: true, message: '请选择生效日期', trigger: ['blur', 'change']},
          ],
          cmEndDate: [
            {required: true, message: '请选择失效时间', trigger: ['blur', 'change']},
          ],
          cmAunit: [
            {required: true, message: '请输入审批单位', trigger: ['blur', 'change']},
            {min: 1, max: 20, message: '审批单位的长度在1~50个字符之间', trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.getCmrprList()
    },
    methods: {
      //获取奖惩记录列表
      async getCmrprList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cmrpr/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取奖惩记录列表失败！')
        }
        this.cmrprList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.cminfos = res.data.cminfos
        this.cmTpyes = res.data.cmTpyes
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCmrprList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCmrprList()
      },
      // 监听添加奖惩记录对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.$refs.addCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 监听修改奖惩记录对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.$refs.editCmAttachmentRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmAttachment = ''
        this.editForm.cmAttachment = ''
      },
      // 点击按钮，添加新奖惩记录
      addCmrpr() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加奖惩记录的网络请求
          //console.log(this.addForm.dictPerms)
          const {data: res} = await this.$http.post('cmrpr/addCmrpr', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加奖惩记录成功！')
          // 隐藏添加奖惩记录的对话框
          this.addDialogVisible = false
          // 重新获取奖惩记录列表数据
          this.getCmrprList()
          //this.reload()
        })
      },
      //监听修改奖惩记录的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cmrpr/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询奖惩记录信息失败！')
        }
        this.editForm = res.data.cmrpr
        this.editForm.cmPeriod = this.editForm.cmPeriod == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改奖惩记录
      editCmrpr() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加奖惩记录的网络请求
          const {data: res} = await this.$http.post('cmrpr/updateCmrpr', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改奖惩记录数据成功！')
          // 隐藏修改奖惩记录的对话框
          this.editDialogVisible = false
          // 重新获取奖惩记录列表数据
          this.getCmrprList()
          //this.reload()
        })
      },
      //点击按钮，删除单个奖惩记录
      async delCmrprById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该奖惩记录, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmrpr/delCmrpr/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除奖惩记录失败！')
        }
        this.$message.success('删除奖惩记录成功！')
        this.getCmrprList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除奖惩记录
      async delCmrprs() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除奖惩记录数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cmrpr/delCmrprs/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除奖惩记录数据失败！')
        }
        this.$message.success('删除奖惩记录数据成功！')
        this.getCmrprList()
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
        return await this.$http.post('cmrpr/upload', formData)
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
