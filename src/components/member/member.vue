<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="13">
          <el-button type="danger" @click="delMembers()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入用户编号"
            v-model="queryInfo.memberId"
            clearable
            @clear="getMemberList"
            @change="getMemberList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入用户姓名"
            v-model="queryInfo.memberName"
            clearable
            @clear="getMemberList"
            @change="getMemberList">
          </el-input>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getMemberList">搜索</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="memberList" row-key="memberId" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="编号" prop="memId" width="70px"></el-table-column>
        <el-table-column label="姓名" prop="memName"></el-table-column>
        <el-table-column label="性别" prop="memSex" width="50px">
          <template slot-scope="scope">{{ scope.row.memSex === '1' ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column label="生日" prop="memBorn"></el-table-column>
        <el-table-column label="邮箱" prop="memMail"></el-table-column>
        <el-table-column label="注册时间" prop="registerTime"></el-table-column>
        <el-table-column label="级别" prop="roleId">
          <template slot-scope="scope">{{ scope.row.roleId === '0' ? '管理员' : '客户经理' }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.memId)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteMemberById(scope.row.memId)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户角色：">
          <el-switch
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="addForm.roleId"
            active-text="管理员"
            inactive-text="客户经理">
          </el-switch>
        </el-form-item>
        <el-form-item label="用户选择：" prop="memName">
          <el-select v-model="cminfoId" placeholder="请选择用户信息" @change="isSelect">
            <el-option
              v-for="item in this.cminfos"
              :key="item.cmId"
              :label="item.cmName"
              :value="item.cmId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名：">
          <el-input v-model="addForm.memName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="memPass">
          <el-input v-model="addForm.memPass"></el-input>
        </el-form-item>
        <el-form-item label="性别：" prop="memSex">
          <el-radio-group v-model="addForm.memSex" :disabled="true">
            <el-radio label='1'>男</el-radio>
            <el-radio label='0'>女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期：" prop="memBorn" :disabled="true">
          <el-date-picker :disabled="true" type="date" placeholder="选择出生日期" v-model="addForm.memBorn"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱：" prop="memMail">
          <el-input v-model="addForm.memMail"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMember">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <!-- 内容主体区域 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户角色：">
          <el-switch
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="editForm.roleId"
            active-text="管理员"
            inactive-text="客户经理">
          </el-switch>
        </el-form-item>
        <el-form-item label="用户选择：" prop="memName">
          <el-select v-model="editForm.memName" placeholder="请选择用户信息" :disabled="true">
            <el-option
              v-for="item in this.cminfos"
              :key="item.cmId"
              :label="item.cmName"
              :value="item.cmId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名：">
          <el-input v-model="editForm.memName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="密码：" prop="memPass">
          <el-input v-model="editForm.memPass"></el-input>
        </el-form-item>
        <el-form-item label="性别：" prop="memSex">
          <el-radio-group v-model="editForm.memSex" :disabled="true">
            <el-radio label='1'>男</el-radio>
            <el-radio label='0'>女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期：" prop="memBorn" :disabled="true">
          <el-date-picker :disabled="true" type="date" placeholder="选择出生日期" v-model="editForm.memBorn"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="邮箱：" prop="memMail">
          <el-input v-model="editForm.memMail"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMember">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      // 验证邮箱的规则
      var checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法的邮箱
          return cb()
        }
        cb(new Error('邮箱格式不正确！'))
      }
      return {
        //被选中的客户经理编号信息
        cminfoId: '',
        //客户经理信息
        cminfos: [],
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        // 获取用户列表的参数对象
        queryInfo: {
          //查询用户编号
          memberId: '',
          //查询用户姓名
          memberName: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //用户列表
        memberList: [],
        //用户总数
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          roleId: false,
          memName: '',
          memPass: '',
          memSex: '',
          memBorn: '',
          memMail: '',
          isShow: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          roleId: [
            {required: true, message: '请选择用户权限', trigger: ['blur', 'change']}
          ],
          memName: [
            {required: true, message: '请选择用户信息', trigger: ['blur']},
          ],
          memPass: [
            {required: true, message: '请输入用户密码', trigger: 'blur'},
            {min: 5, max: 8, message: '用户密码的长度在5~8个字符之间', trigger: 'blur'}
          ],
          memMail: [
            {required: true, message: '请输入用户邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
        },
        // 修改用户的表单数据
        editForm: {
          memId: '',
          roleId: '',
          memName: '',
          memPass: '',
          memSex: '',
          memBorn: '',
          memMail: '',
          isShow: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          roleId: [
            {required: true, message: '请选择用户权限', trigger: ['blur', 'change']}
          ],
          memPass: [
            {required: true, message: '请输入用户密码', trigger: 'blur'},
            {min: 5, max: 8, message: '用户密码的长度在5~8个字符之间', trigger: 'blur'}
          ],
          memMail: [
            {required: true, message: '请输入用户邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
        }
      }
    },
    created() {
      this.getMemberList()
    },
    methods: {
      //获取用户列表
      async getMemberList() {
        const {data: res} = await this.$http.get('member/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取用户列表失败！')
        }
        this.memberList = res.data.pageInfo.list
        this.cminfos = res.data.cminfos
        this.total = res.data.pageInfo.total
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getMemberList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getMemberList()
      },
      // 监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，添加新用户
      addMember() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加用户的网络请求
          //console.log(this.addForm)
          this.addForm.roleId = this.addForm.roleId == true ? 0 : 1
          this.addForm.isShow = this.addForm.roleId
          const {data: res} = await this.$http.post('member/addMember', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户列表数据
          this.getMemberList()
          this.reload()
        })
      },
      //监听修改用户的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('member/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询用户信息失败！')
        }
        this.editForm = res.data.cMember
        this.editForm.roleId = this.editForm.roleId == 0 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改用户
      editMember() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加用户的网络请求
          this.editForm.roleId = this.editForm.roleId == true ? 0 : 1
          this.editForm.isShow = this.editForm.roleId
          const {data: res} = await this.$http.post('member/updateCMember', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error('修改用户数据失败！')
          }
          this.$message.success('修改用户数据成功！')
          // 隐藏修改用户的对话框
          this.editDialogVisible = false
          // 重新获取用户列表数据
          this.getMemberList()
          this.reload()
        })
      },
      //点击按钮，删除单个用户
      async deleteMemberById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该用户, 是否继续?',
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
        const {data: result} = await this.$http.delete('member/delCMember/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功！')
        this.getMemberList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除用户
      async delMembers() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.memId);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除用户数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('member/delCMembers/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除用户数据失败！')
        }
        this.$message.success('删除用户数据成功！')
        this.getMemberList()
        this.reload()
      },
      async isSelect() {
        const {data: res} = await this.$http.get('cminfo/get/' + this.cminfoId)
        if (res.status !== 200) {
          return this.$message.error('查询客户经理信息失败！')
        }
        var cminfo = res.data.cminfo
        //console.log(cminfo)
        this.addForm.memName = cminfo.cmName
        this.addForm.memSex = cminfo.cmSex
        this.addForm.memBorn = cminfo.cmBirthday
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
