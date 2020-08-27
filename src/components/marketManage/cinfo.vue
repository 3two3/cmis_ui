<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>营销管理</el-breadcrumb-item>
      <el-breadcrumb-item>客户信息管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="10">
          <el-button :style="{ display:this.role }" type="danger" @click="delCinfos()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加客户信息</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理编号"
            v-model="queryInfo.cCmId"
            clearable
            @clear="getCinfoList"
            @change="getCinfoList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户姓名"
            v-model="queryInfo.cName"
            clearable
            @clear="getCinfoList"
            @change="getCinfoList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户身份证号"
            v-model="queryInfo.cSsn"
            clearable
            @clear="getCinfoList"
            @change="getCinfoList">
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getCinfoList">搜索</el-button>
        </el-col>
      </el-row>
      <!-- 客户信息列表区域 -->
      <el-table :data="cinfoList" row-key="cKey" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column label="姓名" prop="cName" width="70"></el-table-column>
        <el-table-column label="身份证号" prop="cSsn"></el-table-column>
        <el-table-column label="联系方式" prop="cTel"></el-table-column>
        <el-table-column label="年收入(万元)" prop="cSalary" width="100px"></el-table-column>
        <el-table-column label="资产(万元)" prop="cBalance" width="100px"></el-table-column>
        <el-table-column label="负债(万元)" prop="cDebt" width="100px"></el-table-column>
        <el-table-column label="业务关联" prop="cBusiness" width="100px"></el-table-column>
        <el-table-column label="客户经理" prop="cRemarks" width="110px"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cKey)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteCinfoById(scope.row.cKey)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10, 50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!--添加客户信息的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加客户信息" :visible.sync="addDialogVisible" width="45%"
               @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
        <el-form-item label="客户姓名：" prop="cName">
          <el-input v-model="addForm.cName" placeholder="请输入客户姓名"></el-input>
        </el-form-item>
        <el-form-item label="身份证号：" prop="cSsn">
          <el-input v-model="addForm.cSsn" placeholder="请输入身份证号"></el-input>
        </el-form-item>
        <el-form-item label="联系方式：" prop="cTel">
          <el-input v-model="addForm.cTel" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item label="年收入(万元)：" prop="cSalary">
          <el-input v-model.number="addForm.cSalary" placeholder="请输入客户年收入"></el-input>
        </el-form-item>
        <el-form-item label="资产(万元)：" prop="cBalance">
          <el-input v-model.number="addForm.cBalance" placeholder="请输入客户资产"></el-input>
        </el-form-item>
        <el-form-item label="负债(万元)：" prop="cDebt">
          <el-input v-model.number="addForm.cDebt" placeholder="请输入客户负债"></el-input>
        </el-form-item>
        <el-form-item label="所在单位：" prop="cUnit">
          <el-input v-model="addForm.cUnit" placeholder="请输入客户所在单位"></el-input>
        </el-form-item>
        <el-form-item label="家庭住址：" prop="cAdd">
          <el-input v-model="addForm.cAdd" placeholder="请输入客户家庭住址"></el-input>
        </el-form-item>
        <el-form-item label="业务关联：" prop="cBusiness">
          <el-input v-model="addForm.cBusiness" placeholder="请输入业务关联"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCinfo">确 定</el-button>
        </span>
    </el-dialog>

    <!--修改客户信息的对话框 -->
    <el-dialog :close-on-click-modal="false" title="修改客户信息" :visible.sync="editDialogVisible" width="45%"
               @close="editDialogClosed">
      <!--内容主体区域-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
        <el-form-item label="客户姓名：" prop="cName">
          <el-input v-model="editForm.cName" placeholder="请输入客户姓名"></el-input>
        </el-form-item>
        <el-form-item label="身份证号：" prop="cSsn">
          <el-input v-model="editForm.cSsn" placeholder="请输入身份证号"></el-input>
        </el-form-item>
        <el-form-item label="联系方式：" prop="cTel">
          <el-input v-model="editForm.cTel" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item label="年收入(万元)：" prop="cSalary">
          <el-input v-model.number="editForm.cSalary" placeholder="请输入客户年收入"></el-input>
        </el-form-item>
        <el-form-item label="资产(万元)：" prop="cBalance">
          <el-input v-model.number="editForm.cBalance" placeholder="请输入客户资产"></el-input>
        </el-form-item>
        <el-form-item label="负债(万元)：" prop="cDebt">
          <el-input v-model.number="editForm.cDebt" placeholder="请输入客户负债"></el-input>
        </el-form-item>
        <el-form-item label="所在单位：" prop="cUnit">
          <el-input v-model="editForm.cUnit" placeholder="请输入客户所在单位"></el-input>
        </el-form-item>
        <el-form-item label="家庭住址：" prop="cAdd">
          <el-input v-model="editForm.cAdd" placeholder="请输入客户家庭住址"></el-input>
        </el-form-item>
        <el-form-item label="业务关联：" prop="cBusiness">
          <el-input v-model="editForm.cBusiness" placeholder="请输入业务关联"></el-input>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCinfo">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      //验证身份证号的验证规则
      var checkIdCard = async (rule, value, cb) => {
        // 验证身份证号的正则表达式
        const regIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        if (regIdCard.test(value)) {
          //await this.autoGene(value.length);
          const result = await this.checkIdCardIsOnly(value)
          if (!result) {
            cb(new Error('已有此身份证的客户存在，请修改！'))
          }
          const res = await this.checkIdCardIsOnlyWithCminfo(value)
          if (!res) {
            cb(new Error('此身份证与客户经理信息重复，请修改！'))
          }
          // 合法的身份证号
          return cb()
        }
        cb(new Error('身份证号格式不正确！'))
      }
      //验证手机号的验证规则
      var checkPhone = (rule, value, cb) => {
        // 验证手机号的正则表达式
        const regPhone = /^1[3|4|5|7|8][0-9]{9}$/
        if (regPhone.test(value)) {
          // 合法的手机号
          return cb()
        }
        cb(new Error('手机号格式不正确！'))
      }
      return {
        //用户权限
        role: '',
        queryInfo: {
          //经理编号查询字段
          cCmId: '',
          //客户姓名查询字段
          cName: '',
          //客户身份证号查询字段
          cSsn: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        //客户信息列表
        cinfoList: [],
        //客户信息总数
        total: 0,
        // 控制添加客户信息对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改客户信息对话框的显示与隐藏
        editDialogVisible: false,
        // 添加客户信息的表单数据
        addForm: {
          //姓名
          cName: '',
          //身份证号
          cSsn: '',
          //手机号
          cTel: '',
          //年收入
          cSalary: '',
          //资产
          cBalance: '',
          //负债
          cDebt: '',
          //业务关联
          cBusiness: '',
          //所在单位
          cUnit: '',
          //家庭住址
          cAdd: '',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cName: [
            {required: true, message: '请输入客户姓名', trigger: 'blur'},
            {min: 2, max: 6, message: '客户姓名的长度在2~6个字符之间', trigger: 'blur'}
          ],
          cSsn: [
            {required: true, message: '请输入客户身份证号', trigger: 'blur'},
            {validator: checkIdCard, trigger: 'blur'}
          ],
          cTel: [
            {required: true, message: '请输入客户手机号', trigger: 'blur'},
            {validator: checkPhone, trigger: 'blur'}
          ],
          cSalary: [
            {required: true, message: '请输入客户年收入(万元)', trigger: 'blur'},
            {type: 'number', message: '客户年收入请输入数字', trigger: 'blur'},
          ],
          cBalance: [
            {required: true, message: '请输入客户资产(万元)', trigger: 'blur'},
            {type: 'number', message: '客户资产请输入数字', trigger: 'blur'},
          ],
          cDebt: [
            {required: true, message: '请输入客户负债(万元)', trigger: 'blur'},
            {type: 'number', message: '客户负债请输入数字', trigger: 'blur'},
          ],
          cBusiness: [
            {required: true, message: '请输入客户业务关联', trigger: 'blur'},
            {min: 2, max: 10, message: '业务关联的长度在2~10个字符之间', trigger: 'blur'}
          ],
          cUnit: [
            {required: true, message: '请输入客户所在单位', trigger: 'blur'},
            {min: 2, max: 30, message: '客户姓名的长度在2~30个字符之间', trigger: 'blur'}
          ],
          cAdd: [
            {required: true, message: '请输入客户家庭住址', trigger: 'blur'},
            {min: 2, max: 30, message: '客户姓名的长度在2~30个字符之间', trigger: 'blur'}
          ],
        },
        // 修改客户信息的表单数据
        editForm: {
          //编号
          cKey: '',
          //姓名
          cName: '',
          //身份证号
          cSsn: '',
          //手机号
          cTel: '',
          //年收入
          cSalary: '',
          //资产
          cBalance: '',
          //负债
          cDebt: '',
          //业务关联
          cBusiness: '',
          //所在单位
          cUnit: '',
          //家庭住址
          cAdd: '',
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cName: [
            {required: true, message: '请输入客户姓名', trigger: 'blur'},
            {min: 2, max: 6, message: '客户姓名的长度在2~6个字符之间', trigger: 'blur'}
          ],
          cSsn: [
            {required: true, message: '请输入客户身份证号', trigger: 'blur'},
            {validator: checkIdCard, trigger: 'blur'}
          ],
          cTel: [
            {required: true, message: '请输入客户手机号', trigger: 'blur'},
            {validator: checkPhone, trigger: 'blur'}
          ],
          cSalary: [
            {required: true, message: '请输入客户年收入(万元)', trigger: 'blur'},
            {type: 'number', message: '客户年收入请输入数字', trigger: 'blur'},
          ],
          cBalance: [
            {required: true, message: '请输入客户资产(万元)', trigger: 'blur'},
            {type: 'number', message: '客户资产请输入数字', trigger: 'blur'},
          ],
          cDebt: [
            {required: true, message: '请输入客户负债(万元)', trigger: 'blur'},
            {type: 'number', message: '客户负债请输入数字', trigger: 'blur'},
          ],
          cBusiness: [
            {required: true, message: '请输入客户业务关联', trigger: 'blur'},
            {min: 2, max: 10, message: '业务关联的长度在2~10个字符之间', trigger: 'blur'}
          ],
          cUnit: [
            {required: true, message: '请输入客户所在单位', trigger: 'blur'},
            {min: 2, max: 30, message: '客户姓名的长度在2~30个字符之间', trigger: 'blur'}
          ],
          cAdd: [
            {required: true, message: '请输入客户家庭住址', trigger: 'blur'},
            {min: 2, max: 30, message: '客户姓名的长度在2~30个字符之间', trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.role = window.localStorage.getItem('role').trim() === '0'.trim() ? '' : 'none'
      this.getCinfoList()
    },
    methods: {
      //获取客户信息列表
      async getCinfoList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cinfo/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取客户信息列表失败！')
        }
        this.cinfoList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getCinfoList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getCinfoList()
      },
      // 监听添加客户信息对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 监听修改客户信息对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，添加新客户信息
      addCinfo() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加客户信息的网络请求
          //console.log(this.addForm)
          const {data: res} = await this.$http.post('cinfo/addCinfo', this.addForm)
          if (res.status !== 200) {
            return this.$message.error('添加客户信息失败！')
          }
          this.$message.success('添加客户信息成功！')
          // 隐藏添加客户信息的对话框
          this.addDialogVisible = false
          // 重新获取客户信息列表数据
          this.getCinfoList()
          //this.reload()
        })
      },
      //监听修改客户信息的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cinfo/get/' + id)
        if (res.msg == "无法操作其他用户的客户信息！") {
          return this.$message.error(res.msg)
        }
        if (res.status !== 200) {
          return this.$message.error('查询客户信息信息失败！')
        }
        this.editForm = res.data.cinfo
        this.editDialogVisible = true;
      },
      // 点击按钮，修改客户信息
      editCinfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加客户信息的网络请求
          const {data: res} = await this.$http.post('cinfo/updateCinfo', this.editForm)
          if (res.status !== 200) {
            return this.$message.error('修改客户信息失败！')
          }
          this.$message.success('修改客户信息成功！')
          // 隐藏修改客户信息的对话框
          this.editDialogVisible = false
          // 重新获取客户信息列表数据
          this.getCinfoList()
          //this.reload()
        })
      },
      //点击按钮，删除单个客户信息
      async deleteCinfoById(id) {
        const {data: result} = await this.$http.delete('cinfo/delCinfo/' + id)
        if (result.msg == "无法操作其他用户的客户信息！") {
          return this.$message.error(result.msg)
        }
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该客户信息, 是否继续?',
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
        if (result.status !== 200) {
          return this.$message.error('删除客户信息失败！')
        }
        this.$message.success('删除客户信息成功！')
        this.getCinfoList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除客户信息
      async delCinfos() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cKey);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除客户信息数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('cinfo/delCinfos/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除客户信息失败！')
        }
        this.$message.success('删除客户信息成功！')
        this.getCinfoList()
        //this.reload()
      },
      async checkIdCardIsOnly(idCard) {
        const formData = new FormData()
        formData.append('idCard', idCard)
        const {data: res} = await this.$http.post('cinfo/checkIdCardIsOnly', formData)
        if (res.status !== 200) {
          return false
        }
        return true
      },
      async checkIdCardIsOnlyWithCminfo(idCard) {
        const formData = new FormData()
        formData.append('idCard', idCard)
        const {data: res} = await this.$http.post('cminfo/checkIdCardIsOnly', formData)
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

  .home-container {
    height: 100%;
  }

  .el-table {
    max-height: 410px;
    overflow: auto;
  }
</style>
