<template>
  <div class="certificate">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息辅助维护</el-breadcrumb-item>
      <el-breadcrumb-item>证照列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="14">
          <el-button type="danger" @click="delCertificates()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加证照</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getCertificateList"
            @change="getCertificateList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select clearable v-model="queryInfo.cmCertificateType" placeholder="请选择证书类型">
            <el-option
              v-for="item in this.certificateTypes"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictName"
              clearable
              @clear="getCertificateList"
              @change="getCertificateList">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCertificateList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 证照信息列表区域 -->
      <el-table :data="certificateList" row-key="cmKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cmRemarks"></el-table-column>
        <el-table-column label="证书名称" prop="cmCertificateName"></el-table-column>
        <el-table-column label="证书类型" prop="cmCertificateType"></el-table-column>
        <el-table-column label="证书编号" prop="cmCertificateNo"></el-table-column>
        <el-table-column label="发证单位" prop="cmCertificateUnit"></el-table-column>
        <el-table-column label="发证时间" prop="cmStartDate"></el-table-column>
        <el-table-column label="失效时间" prop="cmEndDate"></el-table-column>
        <el-table-column label="有效性" prop="cmPeriod">
          <template slot-scope="scope">{{ scope.row.cmPeriod == '1' ? '有效' : '无效' }}</template>
        </el-table-column>
        <el-table-column label="证书附件" prop="cmCertificateUrl">
          <template slot-scope="scope">
            <a class="btn btn-primary"
               :href="'../../static/certificate/'+scope.row.cmId+'/'+scope.row.cmCertificateUrl"
               :download="scope.row.cmCertificateUrl">
              {{scope.row.cmCertificateUrl}}
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
                       @click="deleteCertificateById(scope.row.cmKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加证照信息的对话框 -->
      <el-dialog :close-on-click-modal="false" title="添加证照信息" :visible.sync="addDialogVisible" width="45%"
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
          <el-form-item label="证书名称：" prop="cmCertificateName">
            <el-input v-model="addForm.cmCertificateName" placeholder="请输入证书名称"></el-input>
          </el-form-item>
          <el-form-item label="证书类型：" prop="cmCertificateType">
            <el-select clearable v-model="addForm.cmCertificateType" placeholder="请选择证书类型">
              <el-option
                v-for="item in this.certificateTypes"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="证书编号：" prop="cmCertificateNo">
            <el-input v-model="addForm.cmCertificateNo" placeholder="请输入证书编号"></el-input>
          </el-form-item>
          <el-form-item label="发证单位：" prop="cmCertificateUnit">
            <el-input v-model="addForm.cmCertificateUnit" placeholder="请输入发证单位"></el-input>
          </el-form-item>
          <el-form-item label="发证时间：" prop="cmStartDate">
            <el-date-picker type="date" placeholder="选择发证时间" v-model="addForm.cmStartDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="失效时间：" prop="cmEndDate">
            <el-date-picker type="date" placeholder="选择失效时间" v-model="addForm.cmEndDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="有效性：" prop="cmPeriod">
            <el-switch
              v-model="addForm.cmPeriod"
              active-text="有效"
              inactive-text="无效">
            </el-switch>
          </el-form-item>
          <el-form-item label="证书附件：" prop="cmCertificateUrl">
            <el-upload
              :on-remove="removeCertificate"
              ref="addCertificateRef"
              action="#"
              :limit="1"
              :http-request="getCertificateFile">
              <el-button size="small" type="success">选择证书附件</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCmresult">确 定</el-button>
      </span>
      </el-dialog>

      <!-- 修改证照信息的对话框 -->
      <el-dialog :close-on-click-modal="false" title="修改证照信息" :visible.sync="editDialogVisible" width="45%"
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
          <el-form-item label="证书名称：" prop="cmCertificateName">
            <el-input v-model="editForm.cmCertificateName" placeholder="请输入证书名称"></el-input>
          </el-form-item>
          <el-form-item label="证书类型：" prop="cmCertificateType">
            <el-select clearable v-model="editForm.cmCertificateType" placeholder="请选择证书类型">
              <el-option
                v-for="item in this.certificateTypes"
                :key="item.dictId"
                :label="item.dictName"
                :value="item.dictName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="证书编号：" prop="cmCertificateNo">
            <el-input v-model="editForm.cmCertificateNo" placeholder="请输入证书编号"></el-input>
          </el-form-item>
          <el-form-item label="发证单位：" prop="cmCertificateUnit">
            <el-input v-model="editForm.cmCertificateUnit" placeholder="请输入发证单位"></el-input>
          </el-form-item>
          <el-form-item label="发证时间：" prop="cmStartDate">
            <el-date-picker type="date" placeholder="选择发证时间" v-model="editForm.cmStartDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="失效时间：" prop="cmEndDate">
            <el-date-picker type="date" placeholder="选择失效时间" v-model="editForm.cmEndDate"
                            style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
          </el-form-item>
          <el-form-item label="有效性：" prop="cmPeriod">
            <el-switch
              v-model="editForm.cmPeriod"
              active-text="有效"
              inactive-text="无效">
            </el-switch>
          </el-form-item>
          <el-form-item label="证书附件：" prop="cmCertificateUrl">
            <el-upload
              :on-remove="removeCertificate"
              ref="editCertificateRef"
              action="#"
              :limit="1"
              :http-request="getCertificateFile">
              <el-button size="small" type="success">选择证书附件</el-button>
            </el-upload>
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
      return {
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取证照信息列表的参数对象
        queryInfo: {
          //查询经理编号
          cmId: '',
          //查询证书类型
          cmCertificateType: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //所有证照数据
        certificateList: [],
        //所有客户经理
        cminfos: [],
        //所有证书类型数据
        certificateTypes: [],
        //证照信息总数
        total: 0,
        // 控制添加证照信息对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改证照信息对话框的显示与隐藏
        editDialogVisible: false,
        // 添加证照信息的表单数据
        addForm: {
          cmId: '',
          cmCertificateName: '',
          cmCertificateType: '',
          cmCertificateNo: '',
          cmCertificateUnit: '',
          cmStartDate: '',
          cmEndDate: '',
          cmPeriod: false,
          cmCertificateUrl: '',
          cmRemarks: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmCertificateName: [
            {required: true, message: '请输入证书名称', trigger: ['blur', 'change']},
            {min: 2, max: 20, message: '证书名称的长度在2~20个字符之间', trigger: 'blur'}
          ],
          cmCertificateType: [
            {required: true, message: '请选择证书类型', trigger: ['blur', 'change']}
          ],
          cmCertificateNo: [
            {required: true, message: '请输入证书编号', trigger: ['blur', 'change']},
            {min: 1, max: 30, message: '证书编号的长度在1~30个字符之间', trigger: 'blur'}
          ],
          cmCertificateUnit: [
            {required: true, message: '请输入发证单位', trigger: ['blur', 'change']},
            {min: 2, max: 30, message: '发证单位的长度在2~30个字符之间', trigger: 'blur'}
          ],
          cmStartDate: [
            {required: true, message: '请选择发证时间', trigger: ['blur', 'change']},
          ],
          cmEndDate: [
            {required: true, message: '请选择失效时间', trigger: ['blur', 'change']},
          ],
        },
        // 修改证照信息的表单数据
        editForm: {
          cmKey: '',
          cmId: '',
          cmCertificateName: '',
          cmCertificateType: '',
          cmCertificateNo: '',
          cmCertificateUnit: '',
          cmStartDate: '',
          cmEndDate: '',
          cmPeriod: '',
          cmCertificateUrl: '',
          cmRemarks: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmId: [
            {required: true, message: '请选择客户经理', trigger: ['blur', 'change']}
          ],
          cmCertificateName: [
            {required: true, message: '请输入证书名称', trigger: ['blur', 'change']}
          ],
          cmCertificateType: [
            {required: true, message: '请选择证书类型', trigger: ['blur', 'change']}
          ],
          cmCertificateNo: [
            {required: true, message: '请输入证书编号', trigger: ['blur', 'change']}
          ],
          cmCertificateUnit: [
            {required: true, message: '请输入发证单位', trigger: ['blur', 'change']}
          ],
          cmStartDate: [
            {required: true, message: '请选择发证时间', trigger: ['blur', 'change']},
          ],
          cmEndDate: [
            {required: true, message: '请选择失效时间', trigger: ['blur', 'change']},
          ],
        }
      }
    },
    created() {
      this.getCertificateList()
    },
    methods: {
      //获取证照信息列表
      async getCertificateList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('certificate/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取证照信息列表失败！')
        }
        this.certificateList = res.data.pageInfo.list
        this.addForm.cmPeriod = this.addForm.cmPeriod == 0 ? '失效' : '有效'
        this.total = res.data.pageInfo.total
        this.cminfos = res.data.cminfos
        this.certificateTypes = res.data.certificateTypes
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCertificateList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCertificateList()
      },
      // 监听添加证照信息对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.$refs.addCertificateRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmCertificateUrl = ''
        this.editForm.cmCertificateUrl = ''
      },
      // 监听修改证照信息对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
        this.$refs.editCertificateRef.clearFiles()
        this.addForm.cmRemarks = ''
        this.editForm.cmRemarks = ''
        this.addForm.cmCertificateUrl = ''
        this.editForm.cmCertificateUrl = ''
      },
      // 点击按钮，添加新证照信息
      addCmresult() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加证照信息的网络请求
          //console.log(this.addForm.dictPerms)
          this.addForm.cmPeriod = this.addForm.cmPeriod == true ? 1 : 0
          const {data: res} = await this.$http.post('certificate/addCertificate', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加证照信息成功！')
          // 隐藏添加证照信息的对话框
          this.addDialogVisible = false
          // 重新获取证照信息列表数据
          this.getCertificateList()
          ////this.reload()
        })
      },
      //监听修改证照信息的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('certificate/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询证照信息信息失败！')
        }
        this.editForm = res.data.certificate
        this.editForm.cmPeriod = this.editForm.cmPeriod == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改证照信息
      editCmresult() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加证照信息的网络请求
          this.editForm.cmPeriod = this.editForm.cmPeriod == true ? 1 : 0
          const {data: res} = await this.$http.post('certificate/updateCertificate', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改证照信息数据成功！')
          // 隐藏修改证照信息的对话框
          this.editDialogVisible = false
          // 重新获取证照信息列表数据
          this.getCertificateList()
          ////this.reload()
        })
      },
      //点击按钮，删除单个证照信息
      async deleteCertificateById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该证照信息, 是否继续?',
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
        const {data: result} = await this.$http.delete('certificate/delCertificate/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除证照信息失败！')
        }
        this.$message.success('删除证照信息成功！')
        this.getCertificateList()
        ////this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除证照信息
      async delCertificates() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除证照信息数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('certificate/delCertificates/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除证照信息数据失败！')
        }
        this.$message.success('删除证照信息数据成功！')
        this.getCertificateList()
        ////this.reload()
      },
      bindCmName(cmName) {
        this.addForm.cmRemarks = cmName
        this.editForm.cmRemarks = cmName
      },
      async getCertificateFile(item) {
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
        return await this.$http.post('certificate/upload', formData)
      },
      removeCertificate() {
        this.addForm.cmCertificateUrl = ''
        this.editForm.cmCertificateUrl = ''
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
