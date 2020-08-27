<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统菜单</el-breadcrumb-item>
      <el-breadcrumb-item>数据字典</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="10">
          <el-button type="danger" @click="delDicts()">批量删除</el-button>
          <el-button type="primary" @click="addDialogVisible = true">添加字典数据</el-button>
        </el-col>
        <el-col :span="8">
          <el-input placeholder="请输入字典名称" v-model="queryInfo.query" clearable @clear="getdictList"
                    @change="getdictList">
            <el-select v-model="queryInfo.selectType" slot="prepend" placeholder="请选择类型" style="width: 120px" clearable
                       @change="getdictList">
              <el-option
                v-for="item in types"
                :key="item.dictTypeName"
                :label="item.dictTypeName"
                :value="item.dictTypeName">
              </el-option>
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="getdictList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addTypeDialogVisible = true">添加字典类型</el-button>
          <el-button type="danger" @click="delTypeDialogVisible = true">删除字典类型</el-button>
        </el-col>
      </el-row>

      <!-- 字典列表区域 -->
      <el-table :data="dictlist" row-key="dictId" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="标签名" prop="dictName"></el-table-column>
        <el-table-column label="类型" prop="dictType"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.dictId)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deletedictById(scope.row.dictId)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10,50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加字典类型的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加字典类型" :visible.sync="addTypeDialogVisible" width="45%"
               @close="addTypeDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addTypeForm" :rules="addTypeFormRules" ref="addTypeFormRef" label-width="200px">
        <el-form-item label="类型名称：" prop="dictTypeName">
          <el-input v-model="addTypeForm.dictTypeName"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addTypeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDictType">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除字典类型的对话框 -->
    <el-dialog :close-on-click-modal="false" title="删除字典类型" :visible.sync="delTypeDialogVisible" width="45%">
      <!-- 内容主体区域 -->
      <el-form :model="delTypeForm" :rules="delTypeFormRules" ref="delTypeFormRef" label-width="200px">
        <el-form-item label="类型：" prop="dictTypeName">
          <el-select v-model="delTypeForm.dictTypeId" placeholder="请选择">
            <el-option
              v-for="item in types"
              :key="item.dictTypeId"
              :label="item.dictTypeName"
              :value="item.dictTypeId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="delTypeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="delDictType">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加字典的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加字典" :visible.sync="addDialogVisible" width="45%"
               @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
        <el-form-item label="标签名：" prop="dictName">
          <el-input v-model="addForm.dictName"></el-input>
        </el-form-item>
        <el-form-item label="类型：" prop="dictValue">
          <el-select v-model="addForm.dictValue" placeholder="请选择">
            <el-option
              v-for="item in types"
              :key="item.dictTypeId"
              :label="item.dictTypeName"
              :value="item.dictTypeId" @click.native="bindDictTypeName(item.dictTypeName)">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDict">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改字典的对话框 -->
    <!-- 内容主体区域 -->
    <el-dialog :close-on-click-modal="false" title="修改字典" :visible.sync="editDialogVisible" width="45%"
               @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
        <el-form-item label="标签名：" prop="dictName">
          <el-input v-model="editForm.dictName"></el-input>
        </el-form-item>
        <el-form-item label="类型：" prop="dictValue">
          <el-select v-model="editForm.dictValue" placeholder="请选择">
            <el-option
              v-for="item in types"
              :key="item.dictTypeId"
              :label="item.dictTypeName"
              :value="item.dictTypeId" @click.native="bindDictTypeName2(item.dictTypeName)">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDict">确 定</el-button>
      </span>
    </el-dialog>
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
        // 获取字典列表的参数对象
        queryInfo: {
          //查询字典名称
          query: '',
          //查询字典类型
          selectType: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //类型数组
        types: [],
        //字典列表
        dictlist: [],
        //字典总数
        total: 0,
        // 控制添加字典类型对话框的显示与隐藏
        addTypeDialogVisible: false,
        // 控制删除字典类型对话框的显示与隐藏
        delTypeDialogVisible: false,
        // 控制添加字典对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改字典对话框的显示与隐藏
        editDialogVisible: false,
        // 添加字典类型的表单数据
        addTypeForm: {
          dictTypeName: ''
        },
        // 添加字典类型表单的验证规则对象
        addTypeFormRules: {
          dictTypeName: [
            {required: true, message: '请输入字典类型', trigger: 'blur'},
          ]
        },
        // 删除字典类型的表单数据
        delTypeForm: {
          dictTypeId: ''
        },
        // 删除字典类型表单的验证规则对象
        delTypeFormRules: {
          dictTypeId: [
            {required: true, message: '请选择字典类型', trigger: 'blur'},
          ]
        },
        // 添加字典的表单数据
        addForm: {
          dictName: '',
          dictValue: '',
          dictType: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          dictName: [
            {required: true, message: '请输入字典名称', trigger: 'blur'}
          ],
          dictValue: [
            {required: true, message: '请选择类型', trigger: 'blur'},
          ]
        },
        // 修改字典的表单数据
        editForm: {
          dictId: '',
          dictName: '',
          dictValue: '',
          dictType: ''
        },
        //  修改表单的验证规则对象
        editFormRules: {
          dictName: [
            {required: true, message: '请输入字典名称', trigger: 'blur'}
          ],
          dictValue: [
            {required: true, message: '请选择类型', trigger: 'blur'},
          ]
        }
      }
    },
    created() {
      this.getdictList()
    },
    methods: {
      //获取字典列表
      async getdictList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('dict/dicts', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取字典列表失败！')
        }
        this.dictlist = res.data.pageInfo.list
        this.types = res.data.types
        this.total = res.data.pageInfo.total
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getdictList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getdictList()
      },
      // 监听添加字典类型对话框的关闭事件
      addTypeDialogClosed() {
        this.$refs.addTypeFormRef.resetFields()
      },
      // 监听添加字典对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 监听修改字典对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，添加新字典类型
      addDictType() {
        this.$refs.addTypeFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('dict/addDictType', this.addTypeForm)
          if (res.status !== 200) {
            this.addTypeDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加字典类型成功！')
          this.addTypeDialogVisible = false
          this.getdictList()
          //this.reload()
        })
      },
      // 点击按钮，添加新字典
      addDict() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加字典的网络请求
          //console.log(this.addForm.dictPerms)
          const {data: res} = await this.$http.post('dict/addDict', this.addForm)
          if (res.status !== 200) {
            this.addDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('添加字典成功！')
          // 隐藏添加字典的对话框
          this.addDialogVisible = false
          // 重新获取字典列表数据
          this.getdictList()
          //this.reload()
        })
      },
      //监听修改字典的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('dict/get/' + id)
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('查询字典信息失败！')
        }
        this.editForm = res.data.dict
        this.editDialogVisible = true;
      },
      // 点击按钮，修改字典
      editDict() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加字典的网络请求
          const {data: res} = await this.$http.post('dict/updateDict', this.editForm)
          if (res.status !== 200) {
            this.editDialogVisible = false
            return this.$message.error(res.msg)
          }
          this.$message.success('修改字典数据成功！')
          // 隐藏修改字典的对话框
          this.editDialogVisible = false
          // 重新获取字典列表数据
          this.getdictList()
          //this.reload()
        })
      },
      //点击按钮，删除单个字典类型
      async delDictType() {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该字典类型, 是否继续?',
          '提示', {
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
        const {data: res} = await this.$http.get('dict/getDictByType/' + this.delTypeForm.dictTypeId)
        //console.log(res)
        if (res.status == 200) {
          this.delTypeDialogVisible = false
          return this.$message.error('该字典类型下还有数据，请先清除该字典类型数据！')
        }
        const {data: result} = await this.$http.delete('dict/delDictType/' + this.delTypeForm.dictTypeId)
        if (result.status !== 200) {
          this.delTypeDialogVisible = false
          return this.$message.error('删除字典类型失败！')
        }
        this.delTypeDialogVisible = false
        this.$message.success('删除字典类型成功！')
        this.getdictList()
        //this.reload()
      },
      //点击按钮，删除单个字典
      async deletedictById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该字典, 是否继续?',
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
        const {data: result} = await this.$http.delete('dict/delDict/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除字典失败！')
        }
        this.$message.success('删除字典成功！')
        this.getdictList()
        //this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除字典
      async delDicts() {
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.dictId);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        if (params.length > 0) {
          // 弹框询问用户是否删除数据
          const confirmResult = await this.$confirm(
            '此操作将永久删除字典数据, 是否继续?',
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
        const {data: result} = await this.$http.delete('dict/delDicts/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除字典数据失败！')
        }
        this.$message.success('删除字典数据成功！')
        this.getdictList()
        //this.reload()
      },
      //绑定字典类型
      bindDictTypeName(dictTypeName) {
        this.addForm.dictType = dictTypeName
      },
      bindDictTypeName2(dictTypeName) {
        this.editForm.dictType = dictTypeName
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

  .el-table {
    max-height: 410px;
    overflow: auto;
  }
</style>
