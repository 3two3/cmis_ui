<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统菜单</el-breadcrumb-item>
      <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="3">
          <el-button type="primary" @click="addParentDialogVisible = true">添加父菜单</el-button>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" @click="addDialogVisible = true">添加子菜单</el-button>
        </el-col>
      </el-row>
      <!-- 菜单列表区域 -->
      <el-table :data="menuParents" row-key="menuId" border stripe default-expand-all
                :tree-props="{children: 'menus', hasChildren: 'hasChildren'}" v-loading="loading">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="名称" prop="menuName" width="200px"></el-table-column>
        <el-table-column label="父级菜单" prop="parentName"></el-table-column>
        <el-table-column label="地址" prop="menuUrl"></el-table-column>
        <el-table-column label="经理权限" prop="isShow">
          <template slot-scope="scope">{{ scope.row.isShow === '0' ? '否' : '是' }}</template>
        </el-table-column>
        <el-table-column label="图标" prop="menuIcon"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="scope.row.parentName === '根菜单' ? showEditParentDialog(scope.row.menuId) : showEditDialog(scope.row.menuId)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="scope.row.parentName === '根菜单' ? deleteMenuParentById(scope.row.menuId) : deleteMenuById(scope.row.menuId)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加父菜单的对话框 -->
    <el-dialog title="添加父菜单" :visible.sync="addParentDialogVisible" width="40%" @close="addParentDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="名称：" prop="menuName">
          <el-input v-model="addForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="经理权限" prop="isShow">
          <el-switch
            v-model="addForm.isShow"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="图标：" prop="menuIcon">
          <el-input v-model="addForm.menuIcon"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParentDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenuParent">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加菜单的对话框 -->
    <el-dialog title="添加菜单" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="名称：" prop="menuName">
          <el-input v-model="addForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="父级菜单：" prop="parentName">
          <el-select v-model="addForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in menuParents"
              :key="item.menuId"
              :label="item.menuName"
              :value="item.menuId" @click.native="bindParentName(item.menuName)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址：" prop="menuUrl">
          <el-input v-model="addForm.menuUrl"></el-input>
        </el-form-item>
        <el-form-item label="经理权限" prop="isShow">
          <el-switch
            v-model="addForm.isShow"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="图标：" prop="menuIcon">
          <el-input v-model="addForm.menuIcon"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenu">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改父菜单的对话框 -->
    <el-dialog title="修改父菜单" :visible.sync="editParentDialogVisible" width="40%" @close="editParentDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="名称：" prop="menuName">
          <el-input v-model="editForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="经理权限" prop="isShow">
          <el-switch
            v-model="editForm.isShow"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="图标：" prop="menuIcon">
          <el-input v-model="editForm.menuIcon"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParentDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMenuParent">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改菜单的对话框 -->
    <el-dialog title="修改菜单" :visible.sync="editDialogVisible" width="40%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="名称：" prop="menuName">
          <el-input v-model="editForm.menuName"></el-input>
        </el-form-item>
        <el-form-item label="父级菜单：" prop="parentName">
          <el-select v-model="editForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in menuParents"
              :key="item.menuId"
              :label="item.menuName"
              :value="item.menuId" @click.native="bindParentName(item.menuName)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地址：" prop="menuUrl">
          <el-input v-model="editForm.menuUrl"></el-input>
        </el-form-item>
        <el-form-item label="经理权限" prop="isShow">
          <el-switch
            v-model="editForm.isShow"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="图标：" prop="menuIcon">
          <el-input v-model="editForm.menuIcon"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMenu">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    inject: ['reload'],
    data() {
      return {
        //表格加载
        loading: true,
        //菜单列表
        menuParents: [],
        // 控制添加父菜单对话框的显示与隐藏
        addParentDialogVisible: false,
        // 控制修改父菜单对话框的显示与隐藏
        editParentDialogVisible: false,
        // 控制添加菜单对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改菜单对话框的显示与隐藏
        editDialogVisible: false,
        // 添加菜单的表单数据
        addForm: {
          menuName: '',
          parentId: '',
          parentName: '',
          menuUrl: '',
          isShow: 'true',
          menuIcon: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          menuName: [
            {required: true, message: '请输入菜单名称', trigger: 'blur'},
          ],
          menuUrl: [
            {required: true, message: '请输入菜单地址', trigger: 'blur'},
          ],
          menuIcon: [
            {required: true, message: '请输入菜单图标', trigger: 'blur'},
          ]
        },
        // 添加菜单的表单数据
        editForm: {
          menuName: '',
          parentId: '',
          parentName: '',
          menuUrl: '',
          isShow: 'true',
          menuIcon: ''
        },
        // 添加表单的验证规则对象
        editFormRules: {
          menuName: [
            {required: true, message: '请输入菜单名称', trigger: 'blur'},
          ],
          menuUrl: [
            {required: true, message: '请输入菜单地址', trigger: 'blur'},
          ],
          menuIcon: [
            {required: true, message: '请输入菜单图标', trigger: 'blur'},
          ]
        }
      }
    },
    created() {
      this.getMenuList()
    },
    methods: {
      //获取菜单列表
      async getMenuList() {
        const {data: res} = await this.$http.get('menu/list')
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取菜单列表失败！')
        }
        this.menuParents = res.data.menuParents
        this.loading = false
      },
      // 监听添加父菜单对话框的关闭事件
      addParentDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 监听修改父菜单对话框的关闭事件
      editParentDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 监听添加菜单对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 监听修改菜单对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，添加新菜单
      //绑定父菜单名称
      bindParentName(menuName) {
        this.addForm.parentName = menuName
      },
      //添加父菜单
      addMenuParent() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加菜单的网络请求
          //console.log(this.addForm.isShow)
          this.addForm.isShow = this.addForm.isShow === true ? 1 : 0
          const {data: res} = await this.$http.post('menu/addParentMenu', this.addForm)
          if (res.status !== 200) {
            // 隐藏添加菜单的对话框
            this.addParentDialogVisible = false
            // 重新获取菜单列表数据
            this.getMenuList()
            return this.$message.error('添加父级菜单失败！')
          }
          this.$message.success('添加父级菜单成功！')
          // 隐藏添加菜单的对话框
          this.addParentDialogVisible = false
          // 重新获取菜单列表数据
          this.getMenuList()
          this.reload()
        })
      },
      // 点击按钮，添加新菜单
      addMenu() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加菜单的网络请求
          this.addForm.isShow = this.addForm.isShow === true ? 1 : 0
          const {data: res} = await this.$http.post('menu/addMenu', this.addForm)
          if (res.status !== 200) {
            // 隐藏添加菜单的对话框
            this.addDialogVisible = false
            // 重新获取菜单列表数据
            this.getMenuList()
            return this.$message.error('添加子菜单失败！')
          }
          this.$message.success('添加子菜单成功！')
          // 隐藏添加菜单的对话框
          this.addDialogVisible = false
          // 重新获取菜单列表数据
          this.getMenuList()
          this.reload()
        })
      },
      //监听修改父菜单的对话框事件
      async showEditParentDialog(id) {
        const {data: res} = await this.$http.get('menu/getParent/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询父菜单信息失败！')
        }
        this.editForm = res.data.menuParent
        this.editForm.isShow = this.editForm.isShow == 1 ? true : false
        this.editParentDialogVisible = true;
      },
      // 点击按钮，修改父级菜单
      editMenuParent() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加菜单的网络请求
          this.editForm.isShow = this.editForm.isShow == true ? 1 : 0
          const {data: res} = await this.$http.post('menu/updateMenuParent', this.editForm)
          if (res.status !== 200) {
            return this.$message.error('修改父级菜单失败！')
          }
          this.$message.success('修改父级菜单成功！')
          // 隐藏修改菜单的对话框
          this.editParentDialogVisible = false
          // 重新获取菜单列表数据
          this.getMenuList()
          this.reload()
        })
      },
      //监听修改菜单的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('menu/getMenu/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询菜单信息失败！')
        }
        this.editForm = res.data.menuManagement
        this.editForm.isShow = this.editForm.isShow == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改菜单
      editMenu() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加菜单的网络请求
          this.editForm.isShow = this.editForm.isShow == true ? 1 : 0
          const {data: res} = await this.$http.post('menu/updateMenu', this.editForm)
          if (res.status !== 200) {
            return this.$message.error('修改子菜单失败！')
          }
          this.$message.success('修改子菜单成功！')
          // 隐藏修改菜单的对话框
          this.editDialogVisible = false
          // 重新获取菜单列表数据
          this.getMenuList()
          this.reload()
        })
      },
      //点击按钮，删除单个父菜单
      async deleteMenuParentById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该菜单, 是否继续?',
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
        const {data: res} = await this.$http.get('menu/getMenuByParentId/' + id)
        if (res.status == 200) {
          return this.$message.error('该父级菜单下还有菜单，请先删除其子菜单！')
        }
        const {data: result} = await this.$http.delete('menu/delMenuParent/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除父菜单失败！')
        }
        this.$message.success('删除子菜单成功！')
        this.getMenuList()
        this.reload()
      },
      //点击按钮，删除单个子菜单
      async deleteMenuById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该菜单, 是否继续?',
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
        const {data: result} = await this.$http.delete('menu/delMenu/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除子菜单失败！')
        }
        this.$message.success('删除子菜单成功！')
        this.getMenuList()
        this.reload()
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
