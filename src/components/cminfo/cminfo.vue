<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>客户经理信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>经理信息综合维护</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="5">
        <el-col :span="7">
          <el-button type="danger" @click="delCminfos()">批量删除</el-button>
          <el-button type="primary" @click="openAddDialogVisible()">添加客户经理</el-button>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入单位名称"
            v-model="queryInfo.cmUnit"
            clearable
            @clear="getcmsList"
            @change="getcmsList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理编号"
            v-model="queryInfo.cmId"
            clearable
            @clear="getcmsList"
            @change="getcmsList">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-input
            placeholder="请输入客户经理姓名"
            v-model="queryInfo.cmName"
            clearable
            @clear="getcmsList"
            @change="getcmsList">
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-select v-model="queryInfo.cmStatus" clearable placeholder="请选择状态" @clear="getcmsList"
                     @change="getcmsList">
            <el-option
              v-for="item in cmStatus_arr"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="1">
          <el-button type="primary" icon="el-icon-search" @click="getcmsList">搜索</el-button>
        </el-col>
      </el-row>
      <!-- 客户经理列表区域 -->
      <el-table :data="cmsList" row-key="cmId" border stripe v-loading="loading"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55">
        </el-table-column>
        <el-table-column label="客户经理编号" prop="cmId" width="120"></el-table-column>
        <el-table-column label="姓名" prop="cmName" width="70"></el-table-column>
        <el-table-column label="性别" prop="cmSex" width="55">
          <template slot-scope="scope">{{ scope.row.cmSex === '1' ? '男' : '女' }}</template>
        </el-table-column>
        <el-table-column label="身份证号" prop="cmSsn"></el-table-column>
        <el-table-column label="出生日期" prop="cmBirthday" sortable></el-table-column>
        <el-table-column label="客户经理等级" prop="cmLevel"></el-table-column>
        <el-table-column label="单位" prop="cmUnit" width="70"></el-table-column>
        <el-table-column label="部门" prop="cmDept"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.cmId)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="deleteCminfoById(scope.row.cmId)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                     :current-page="queryInfo.pageNum" :page-sizes="[1, 5, 10, 50]" :page-size="queryInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!--添加客户经理的对话框 -->
    <el-dialog :close-on-click-modal="false" title="添加客户经理" :visible.sync="addDialogVisible" width="45%"
               @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="200px">
        <el-form-item label="姓名：" prop="cmName">
          <el-input v-model="addForm.cmName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="身份证号：" prop="cmSsn">
          <el-input v-model="addForm.cmSsn" placeholder="请输入身份证号"></el-input>
        </el-form-item>
        <el-form-item label="民族：" prop="cmNation">
          <el-select v-model="addForm.cmNation" placeholder="请选择民族">
            <el-option
              v-for="item in this.nations"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="政治面貌：" prop="cmPoliticalLandscape">
          <el-select v-model="addForm.cmPoliticalLandscape" placeholder="请选择政治面貌">
            <el-option
              v-for="item in this.politicalOutlook"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯：" prop="cmHometown">
          <el-cascader
            v-model="selectNativePlace"
            :options="nativePlace"
            :props="{ expandTrigger: 'hover' }"
            @change="nativePlaceHandleChange" placeholder="请选择籍贯"></el-cascader>
        </el-form-item>
        <el-form-item label="学历：" prop="cmEducation">
          <el-select v-model="addForm.cmEducation" placeholder="请选择学历">
            <el-option
              v-for="item in this.education"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学位：" prop="cmDegree">
          <el-select v-model="addForm.cmDegree" placeholder="请选择学位">
            <el-option
              v-for="item in this.academicDegree"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="毕业院校及专业：" prop="cmGraduated">
          <el-input v-model="addForm.cmGraduated" placeholder="请输入毕业院校及专业"></el-input>
        </el-form-item>
        <el-form-item label="专业技术职称：" prop="cmProfessionalTitles">
          <el-cascader
            v-model="technicalTitle"
            :options="technicalTitles"
            :props="{ expandTrigger: 'hover' }"
            @change="technicalTitleHandleChange" placeholder="请选择专业技术职称"></el-cascader>
        </el-form-item>
        <el-form-item label="等级：" prop="cmLevel">
          <el-select v-model="addForm.cmLevel" placeholder="请选择客户经理等级">
            <el-option
              v-for="item in this.grade"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所在单位：" prop="cmUnit">
          <el-select v-model="addForm.cmUnit" placeholder="请选择所在单位">
            <el-option
              v-for="item in this.jobs"
              :key="item.label"
              :label="item.label"
              :value="item.label" @click.native="bindJobName(item.label)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门：" prop="cmDept">
          <el-select v-model="addForm.cmDept" placeholder="请选择单位部门">
            <el-option
              v-for="item in this.depts"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职务：" prop="cmPosition">
          <el-input v-model="addForm.cmPosition" placeholder="请输入经理职务"></el-input>
        </el-form-item>
        <el-form-item label="业务条线：" prop="cmBusinessLines">
          <el-select v-model="addForm.cmBusinessLines" placeholder="请选择业务条线">
            <el-option
              v-for="item in this.businessLine"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参加工作时间：" prop="cmHiredate">
          <el-date-picker type="date" placeholder="选择参加工作时间" v-model="addForm.cmHiredate"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="入行时间：" prop="cmEntryTime">
          <el-date-picker type="date" placeholder="选择入行时间" v-model="addForm.cmEntryTime"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="从事金融工作年限：" prop="cmFinancialYears">
          <el-input v-model.number="addForm.cmFinancialYears" placeholder="请输入从事金融工作年限"></el-input>
        </el-form-item>
        <el-form-item label="客户经理从业年限：" prop="cmWorkingYears">
          <el-input v-model.number="addForm.cmWorkingYears" placeholder="请输入客户经理从业年限"></el-input>
        </el-form-item>
        <el-form-item label="退出时间：" prop="cmExitTime">
          <el-date-picker type="date" placeholder="选择退出时间" v-model="addForm.cmExitTime"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="办公电话：" prop="cmTel">
          <el-input v-model="addForm.cmTel" placeholder="请输入办公电话"></el-input>
        </el-form-item>
        <el-form-item label="手机：" prop="cmMobile">
          <el-input v-model="addForm.cmMobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="是否在职：" prop="cmStatus">
          <el-switch
            v-model="addForm.cmStatus"
            active-text="在职"
            inactive-text="退出">
          </el-switch>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCminfo">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改客户经理的对话框 -->
    <el-dialog :close-on-click-modal="false" title="修改客户经理" :visible.sync="editDialogVisible" width="45%"
               @close="editDialogClosed">
      <!--内容主体区域-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="200px">
        <el-form-item label="姓名：" prop="cmName">
          <el-input v-model="editForm.cmName" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="身份证号：" prop="cmSsn">
          <el-input v-model="editForm.cmSsn" placeholder="请输入身份证号"></el-input>
        </el-form-item>
        <el-form-item label="民族：" prop="cmNation">
          <el-select v-model="editForm.cmNation" placeholder="请选择民族">
            <el-option
              v-for="item in this.nations"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="政治面貌：" prop="cmPoliticalLandscape">
          <el-select v-model="editForm.cmPoliticalLandscape" placeholder="请选择政治面貌">
            <el-option
              v-for="item in this.politicalOutlook"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯：" prop="cmHometown">
          <el-cascader
            v-model="selectNativePlace"
            :options="nativePlace"
            :props="{ expandTrigger: 'hover' }"
            @change="nativePlaceHandleChange" placeholder="请选择籍贯"></el-cascader>
        </el-form-item>
        <el-form-item label="学历：" prop="cmEducation">
          <el-select v-model="editForm.cmEducation" placeholder="请选择学历">
            <el-option
              v-for="item in this.education"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学位：" prop="cmDegree">
          <el-select v-model="editForm.cmDegree" placeholder="请选择学位">
            <el-option
              v-for="item in this.academicDegree"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="毕业院校及专业：" prop="cmGraduated">
          <el-input v-model="editForm.cmGraduated" placeholder="请输入毕业院校及专业"></el-input>
        </el-form-item>
        <el-form-item label="专业技术职称：" prop="cmProfessionalTitles">
          <el-cascader
            v-model="technicalTitle"
            :options="technicalTitles"
            :props="{ expandTrigger: 'hover' }"
            @change="technicalTitleHandleChange" placeholder="请选择专业技术职称"></el-cascader>
        </el-form-item>
        <el-form-item label="等级：" prop="cmLevel">
          <el-select v-model="editForm.cmLevel" placeholder="请选择客户经理等级">
            <el-option
              v-for="item in this.grade"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所在单位：" prop="cmUnit">
          <el-select v-model="editForm.cmUnit" placeholder="请选择所在单位">
            <el-option
              v-for="item in this.jobs"
              :key="item.label"
              :label="item.label"
              :value="item.label" @click.native="bindJobName(item.label)">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门：" prop="cmDept">
          <el-select v-model="editForm.cmDept" placeholder="请选择单位部门">
            <el-option
              v-for="item in this.depts"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职务：" prop="cmPosition">
          <el-input v-model="editForm.cmPosition" placeholder="请输入经理职务"></el-input>
        </el-form-item>
        <el-form-item label="业务条线：" prop="cmBusinessLines">
          <el-select v-model="editForm.cmBusinessLines" placeholder="请选择业务条线">
            <el-option
              v-for="item in this.businessLine"
              :key="item.dictName"
              :label="item.dictName"
              :value="item.dictName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参加工作时间：" prop="cmHiredate">
          <el-date-picker type="date" placeholder="选择参加工作时间" v-model="editForm.cmHiredate"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="入行时间：" prop="cmEntryTime">
          <el-date-picker type="date" placeholder="选择入行时间" v-model="editForm.cmEntryTime"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="从事金融工作年限：" prop="cmFinancialYears">
          <el-input v-model.number="editForm.cmFinancialYears" placeholder="请输入从事金融工作年限"></el-input>
        </el-form-item>
        <el-form-item label="客户经理从业年限：" prop="cmWorkingYears">
          <el-input v-model.number="editForm.cmWorkingYears" placeholder="请输入客户经理从业年限"></el-input>
        </el-form-item>
        <el-form-item label="退出时间：" prop="cmExitTime">
          <el-date-picker type="date" placeholder="选择退出时间" v-model="editForm.cmExitTime"
                          style="width: 250px;" format="yyyy-MM-dd" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="办公电话：" prop="cmTel">
          <el-input v-model="editForm.cmTel" placeholder="请输入办公电话"></el-input>
        </el-form-item>
        <el-form-item label="手机：" prop="cmMobile">
          <el-input v-model="editForm.cmMobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="是否在职：" prop="cmStatus">
          <el-switch
            v-model="editForm.cmStatus"
            active-text="在职"
            inactive-text="退出">
          </el-switch>
        </el-form-item>
      </el-form>
      <!--底部区域-->
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCminfo">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    provinceAndCityData,
    regionData,
    provinceAndCityDataPlus,
    regionDataPlus,
    CodeToText,
    TextToCode
  } from 'element-china-area-data'

  export default {
    inject: ['reload'],
    data() {
      //验证身份证号的验证规则
      var checkIdCard = async (rule, value, cb) => {
        // 验证身份证号的正则表达式
        const regIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        if (regIdCard.test(value)) {
          await this.autoGene(value.length);
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
      //验证座机号的验证规则
      var checkTel = (rule, value, cb) => {
        // 验证座机号的正则表达式
        const regTel = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/
        if (regTel.test(value)) {
          // 合法的座机号
          return cb()
        }
        cb(new Error('固定电话号格式不正确！'))
      }
      //验证数字范围
      var checkNumSize = (rule, value, cb) => {
        if (value < 0 || value > 35) {
          cb(new Error('时间年限应在0-35之间'))
        } else {
          cb()
        }
      }
      return {
        //籍贯
        nativePlace: regionData,
        //籍贯选择后的数组
        selectNativePlace: [],
        //后台获取所有民族
        nations: [],
        //后台获取所有政治面貌
        politicalOutlook: [],
        //后台获取所有业务条线
        businessLine: [],
        //后台获取所有学历
        education: [],
        //后台获取所有学位
        academicDegree: [],
        //后台获取所有等级
        grade: [],
        //选择后的技术职称数组
        technicalTitle: [],
        //所有技术职称
        technicalTitles: [
          {
            value: '工程专业技术人员',
            label: '工程专业技术人员',
            children: [{
              value: '高级工程师',
              label: '高级工程师',
            }, {
              value: '工程师',
              label: '工程师',
            }, {
              value: '助理工程师',
              label: '助理工程师',
            }
            ]
          },
          {
            value: '经济专业技术人员',
            label: '经济专业技术人员',
            children: [{
              value: '高级经济师',
              label: '高级经济师',
            }, {
              value: '经济师',
              label: '经济师',
            }, {
              value: '助理经济师',
              label: '助理经济师',
            }
            ]
          },
          {
            value: '会计专业技术人员',
            label: '会计专业技术人员',
            children: [{
              value: '高级会计师',
              label: '高级会计师',
            }, {
              value: '会计师',
              label: '会计师',
            }, {
              value: '助理会计师',
              label: '助理会计师',
            }
            ]
          },
          {
            value: '统计专业技术人员',
            label: '统计专业技术人员',
            children: [{
              value: '高级统计师',
              label: '高级统计师',
            }, {
              value: '统计师',
              label: '统计师',
            }, {
              value: '助理统计师',
              label: '助理统计师',
            }
            ]
          },
          {
            value: '审计专业技术人员',
            label: '审计专业技术人员',
            children: [{
              value: '高级审计师',
              label: '高级审计师',
            }, {
              value: '审计师',
              label: '审计师',
            }, {
              value: '助理审计师',
              label: '助理审计师',
            }
            ]
          },
          {
            value: '政工专业技术人员',
            label: '政工专业技术人员',
            children: [{
              value: '高级政工师',
              label: '高级政工师',
            }, {
              value: '政工师',
              label: '政工师',
            }, {
              value: '助理政工师',
              label: '助理政工师',
            }
            ]
          }
        ],
        //所在单位
        jobs: [
          {value: '1', label: '支行'},
          {value: '2', label: '网点'}
        ],
        //后台获取所有部门
        depts: [],
        //接收后台获取数据branchDept
        branchDept: [],
        //接收后台获取数据outlets
        outlets: [],
        // 获取客户经理列表的参数对象
        queryInfo: {
          //机构查询字段
          cmUnit: '',
          //经理编号查询字段
          cmId: '',
          //经理姓名查询字段
          cmName: '',
          //经理状态查询字段
          cmStatus: '',
          // 当前的页数
          pageNum: 1,
          // 当前每页显示多少条数据
          pageSize: 5
        },
        //经理状态数组
        cmStatus_arr: [
          {
            value: '1',
            label: '在职'
          }, {
            value: '0',
            label: '退出'
          }
        ],
        //表格选择
        multipleSelection: [],
        //表格加载
        loading: true,
        //客户经理列表
        cmsList: [],
        //客户经理总数
        total: 0,
        // 控制添加客户经理对话框的显示与隐藏
        addDialogVisible: false,
        // 控制修改客户经理对话框的显示与隐藏
        editDialogVisible: false,
        // 添加客户经理的表单数据
        addForm: {
          //姓名
          cmName: '',
          //性别
          cmSex: '',
          //身份证号
          cmSsn: '',
          //出生年月
          cmBirthday: '',
          //年龄
          cmAge: '',
          //民族
          cmNation: '',
          //政治面貌
          cmPoliticalLandscape: '',
          //籍贯
          cmHometown: '',
          //照片
          cmPhoto: '',
          //学历
          cmEducation: '',
          //学位
          cmDegree: '',
          //毕业院校及专业
          cmGraduated: '',
          //专业技术职称
          cmProfessionalTitles: '',
          //客户经理等级
          cmLevel: '',
          //所在单位
          cmUnit: '',
          //部门
          cmDept: '',
          //职务
          cmPosition: '',
          //业务条线
          cmBusinessLines: '',
          //参加工作时间
          cmHiredate: '',
          //入行时间
          cmEntryTime: '',
          //从事金融工作年限
          cmFinancialYears: '',
          //客户经理从业年限
          cmWorkingYears: '',
          //退出时间
          cmExitTime: '',
          //办公电话
          cmTel: '',
          //手机
          cmMobile: '',
          //经理在职状态
          cmStatus: 'false',
        },
        // 添加表单的验证规则对象
        addFormRules: {
          cmName: [
            {required: true, message: '请输入客户经理名称', trigger: 'blur'},
            {min: 2, max: 6, message: '客户经理名称的长度在2~6个字符之间', trigger: 'blur'}
          ],
          cmSex: [
            {required: true, message: '请选择性别', trigger: 'blur'},
          ],
          cmSsn: [
            {required: true, message: '请输入身份证号', trigger: 'blur'},
            {validator: checkIdCard, trigger: 'blur'}
          ],
          cmBirthday: [
            {required: true, message: '请选择出生年月', trigger: 'blur'},
          ],
          cmAge: [
            {required: true, message: '请输入客户经理年龄', trigger: 'blur'},
            {type: 'number', message: '客户经理年龄请输入数字', trigger: 'blur'},
            {min: 1, max: 3, message: '客户经理年龄长度在1-3个字符之间', trigger: 'blur'}
          ],
          cmNation: [
            {required: true, message: '请选择客户经理民族', trigger: ['blur', 'change']}
          ],
          cmPoliticalLandscape: [
            {required: true, message: '请选择客户经理政治面貌', trigger: ['blur', 'change']}
          ],
          cmHometown: [
            {required: true, message: '请选择客户经理籍贯', trigger: ['blur', 'change']}
          ],
          cmEducation: [
            {required: true, message: '请选择客户经理学历', trigger: ['blur', 'change']}
          ],
          cmDegree: [
            {required: true, message: '请选择客户经理学位', trigger: ['blur', 'change']}
          ],
          cmGraduated: [
            {required: true, message: '请输入客户经理毕业院校及专业', trigger: 'blur'},
            {min: 1, max: 30, message: '客户经理毕业院校及专业长度在1-30个字符之间', trigger: 'blur'}
          ],
          cmProfessionalTitles: [
            {required: true, message: '请选择客户经理专业技术职称', trigger: ['blur', 'change']}
          ],
          cmLevel: [
            {required: true, message: '请选择客户经理等级', trigger: ['blur', 'change']}
          ],
          cmUnit: [
            {required: true, message: '请选择客户经理所在单位', trigger: ['blur', 'change']}
          ],
          cmDept: [
            {required: true, message: '请选择客户经理部门', trigger: ['blur', 'change']}
          ],
          cmPosition: [
            {required: true, message: '请输入客户经理职务', trigger: 'blur'},
            {min: 1, max: 20, message: '客户经理职务长度在1-20个字符之间', trigger: 'blur'}
          ],
          cmBusinessLines: [
            {required: true, message: '请选择客户经理业务条线', trigger: ['blur', 'change']}
          ],
          cmHiredate: [
            {required: true, message: '请选择客户经理参加工作时间', trigger: 'blur'}
          ],
          cmEntryTime: [
            {required: true, message: '请选择客户经理入行时间', trigger: 'blur'}
          ],
          cmFinancialYears: [
            {required: true, message: '请输入客户经理从事金融工作年限', trigger: 'blur'},
            {type: 'number', message: '工作年限请输入数字', trigger: 'blur'},
            {validator: checkNumSize, trigger: 'blur'}
          ],
          cmWorkingYears: [
            {required: true, message: '请输入客户经理从业年限', trigger: 'blur'},
            {type: 'number', message: '从业年限请输入数字', trigger: 'blur'},
            {validator: checkNumSize, trigger: 'blur'}
          ],
          cmExitTime: [
            {required: true, message: '请选择客户经理退出时间', trigger: 'blur'}
          ],
          cmTel: [
            {required: true, message: '请输入客户经理办公电话', trigger: 'blur'},
            {validator: checkTel, trigger: 'blur'}
          ],
          cmMobile: [
            {required: true, message: '请输入客户经理手机号', trigger: 'blur'},
            {validator: checkPhone, trigger: 'blur'}
          ],
          cmStatus: [
            {required: true, message: '请选择客户经理是否在职', trigger: ['blur', 'change']},
          ],
        },
        // 修改客户经理的表单数据
        editForm: {
          //经理编号
          cmId: '',
          //姓名
          cmName: '',
          //性别
          cmSex: '',
          //身份证号
          cmSsn: '',
          //出生年月
          cmBirthday: '',
          //年龄
          cmAge: '',
          //民族
          cmNation: '',
          //政治面貌
          cmPoliticalLandscape: '',
          //籍贯
          cmHometown: '',
          //照片
          cmPhoto: '',
          //学历
          cmEducation: '',
          //学位
          cmDegree: '',
          //毕业院校及专业
          cmGraduated: '',
          //专业技术职称
          cmProfessionalTitles: '',
          //客户经理等级
          cmLevel: '',
          //所在单位
          cmUnit: '',
          //部门
          cmDept: '',
          //职务
          cmPosition: '',
          //业务条线
          cmBusinessLines: '',
          //参加工作时间
          cmHiredate: '',
          //入行时间
          cmEntryTime: '',
          //从事金融工作年限
          cmFinancialYears: '',
          //客户经理从业年限
          cmWorkingYears: '',
          //退出时间
          cmExitTime: '',
          //办公电话
          cmTel: '',
          //手机
          cmMobile: '',
          //经理在职状态
          cmStatus: '',
        },
        //  修改表单的验证规则对象
        editFormRules: {
          cmName: [
            {required: true, message: '请输入客户经理名称', trigger: 'blur'},
            {min: 2, max: 6, message: '客户经理名称的长度在2~6个字符之间', trigger: 'blur'}
          ],
          cmSex: [
            {required: true, message: '请选择性别', trigger: 'blur'},
          ],
          cmSsn: [
            {required: true, message: '请输入身份证号', trigger: 'blur'},
            {validator: checkIdCard, trigger: 'blur'}
          ],
          cmBirthday: [
            {required: true, message: '请选择出生年月', trigger: 'blur'},
          ],
          cmAge: [
            {required: true, message: '请输入客户经理年龄', trigger: 'blur'},
            {type: 'number', message: '客户经理年龄请输入数字', trigger: 'blur'},
            {min: 1, max: 3, message: '客户经理年龄长度在1-3个字符之间', trigger: 'blur'}
          ],
          cmNation: [
            {required: true, message: '请选择客户经理民族', trigger: ['blur', 'change']}
          ],
          cmPoliticalLandscape: [
            {required: true, message: '请选择客户经理政治面貌', trigger: ['blur', 'change']}
          ],
          cmHometown: [
            {required: true, message: '请选择客户经理籍贯', trigger: ['blur', 'change']}
          ],
          cmEducation: [
            {required: true, message: '请选择客户经理学历', trigger: ['blur', 'change']}
          ],
          cmDegree: [
            {required: true, message: '请选择客户经理学位', trigger: ['blur', 'change']}
          ],
          cmGraduated: [
            {required: true, message: '请输入客户经理毕业院校及专业', trigger: 'blur'},
            {min: 1, max: 30, message: '客户经理毕业院校及专业长度在1-30个字符之间', trigger: 'blur'}
          ],
          cmProfessionalTitles: [
            {required: true, message: '请选择客户经理专业技术职称', trigger: ['blur', 'change']}
          ],
          cmLevel: [
            {required: true, message: '请选择客户经理等级', trigger: ['blur', 'change']}
          ],
          cmUnit: [
            {required: true, message: '请选择客户经理所在单位', trigger: ['blur', 'change']}
          ],
          cmDept: [
            {required: true, message: '请选择客户经理部门', trigger: ['blur', 'change']}
          ],
          cmPosition: [
            {required: true, message: '请输入客户经理职务', trigger: 'blur'},
            {min: 1, max: 20, message: '客户经理职务长度在1-20个字符之间', trigger: 'blur'}
          ],
          cmBusinessLines: [
            {required: true, message: '请选择客户经理业务条线', trigger: ['blur', 'change']}
          ],
          cmHiredate: [
            {required: true, message: '请选择客户经理参加工作时间', trigger: 'blur'}
          ],
          cmEntryTime: [
            {required: true, message: '请选择客户经理入行时间', trigger: 'blur'}
          ],
          cmFinancialYears: [
            {required: true, message: '请输入客户经理从事金融工作年限', trigger: 'blur'},
            {type: 'number', message: '工作年限请输入数字', trigger: 'blur'},
            {validator: checkNumSize, trigger: 'blur'}
          ],
          cmWorkingYears: [
            {required: true, message: '请输入客户经理从业年限', trigger: 'blur'},
            {type: 'number', message: '从业年限请输入数字', trigger: 'blur'},
            {validator: checkNumSize, trigger: 'blur'}
          ],
          cmExitTime: [
            {required: true, message: '请选择客户经理退出时间', trigger: 'blur'}
          ],
          cmTel: [
            {required: true, message: '请输入客户经理办公电话', trigger: 'blur'},
            {validator: checkTel, trigger: 'blur'}
          ],
          cmMobile: [
            {required: true, message: '请输入客户经理手机号', trigger: 'blur'},
            {validator: checkPhone, trigger: 'blur'}
          ],
          cmStatus: [
            {required: true, message: '请选择客户经理是否在职', trigger: ['blur', 'change']},
          ],
        }
      }
    },
    created() {
      this.getcmsList()
    },
    methods: {
      // 实现自动生成生日，性别，年龄
      autoGene(val) {
        let idCard = this.addForm.cmSsn;
        let sex = null;
        let birth = null;
        let nowDate = new Date();
        let month = nowDate.getMonth() + 1;
        let day = nowDate.getDate();
        let age = 0;
        if (val === 18) {
          age = nowDate.getFullYear() - idCard.substring(6, 10) - 1;
          sex = idCard.substring(16, 17);
          birth = idCard.substring(6, 10) + "-" + idCard.substring(10, 12) + "-" + idCard.substring(12, 14);
          if (idCard.substring(10, 12) < month || idCard.substring(10, 12) == month && idCard.substring(12, 14) <= day) age++;

        }
        if (val === 15) {
          age = nowDate.getFullYear() - idCard.substring(6, 8) - 1901;
          sex = idCard.substring(13, 14);
          birth = "19" + idCard.substring(6, 8) + "-" + idCard.substring(8, 10) + "-" + idCard.substring(10, 12);
          if (idCard.substring(8, 10) < month || idCard.substring(8, 10) == month && idCard.substring(10, 12) <= day) age++;
        }
        if (sex % 2 === 0)
        //0为女
          sex = '0';
        else
        //1为男
          sex = '1';
        this.addForm.cmSex = sex;
        this.addForm.cmAge = age;
        this.addForm.cmBirthday = birth;
      },
      //获取客户经理列表
      async getcmsList() {
        //console.log(this.queryInfo)
        const {data: res} = await this.$http.get('cminfo/list', {
          params: this.queryInfo
        })
        //console.log(res)
        if (res.status !== 200) {
          return this.$message.error('获取客户经理列表失败！')
        }
        this.cmsList = res.data.pageInfo.list
        this.total = res.data.pageInfo.total
        this.nations = res.data.nations
        this.politicalOutlook = res.data.politicalOutlook
        this.education = res.data.education
        this.academicDegree = res.data.academicDegree
        this.businessLine = res.data.businessLine
        this.grade = res.data.grade
        this.branchDept = res.data.branchDept
        this.outlets = res.data.outlets
        this.loading = false
        //console.log(res)
      },
      // 监听 pageSize 改变的事件
      handleSizeChange(newSize) {
        //console.log(newSize)
        this.queryInfo.pageSize = newSize
        this.getcmsList()
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        //console.log(newPage)
        this.queryInfo.pageNum = newPage
        this.getcmsList()
      },
      // 监听添加客户经理对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
        this.selectNativePlace = []
      },
      // 监听修改客户经理对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，添加新客户经理
      addCminfo() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加客户经理的网络请求
          //console.log(this.addForm)
          this.addForm.cmStatus = this.addForm.cmStatus == true ? 1 : 0
          const {data: res} = await this.$http.post('cminfo/addCminfo', this.addForm)
          if (res.status !== 200) {
            return this.$message.error('添加客户经理失败！')
          }
          this.$message.success('添加客户经理成功！')
          // 隐藏添加客户经理的对话框
          this.addDialogVisible = false
          // 重新获取客户经理列表数据
          this.getcmsList()
          this.reload()
        })
      },
      //监听修改客户经理的对话框事件
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('cminfo/get/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询客户经理信息失败！')
        }
        var hometown = res.data.cminfo.cmHometown.split('-')
        this.selectNativePlace = []
        this.selectNativePlace[0] = TextToCode[hometown[0]].code.toString()
        this.selectNativePlace[1] = TextToCode[hometown[0]][hometown[1]].code.toString()
        this.selectNativePlace[2] = TextToCode[hometown[0]][hometown[1]][hometown[2]].code.toString()
        this.technicalTitle = res.data.cminfo.cmProfessionalTitles.split('-')
        this.editForm = res.data.cminfo
        this.editForm.cmStatus = this.editForm.cmStatus == 1 ? true : false
        this.editDialogVisible = true;
      },
      // 点击按钮，修改客户经理
      editCminfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 可以发起添加客户经理的网络请求
          this.editForm.cmStatus = this.editForm.cmStatus == true ? 1 : 0
          const {data: res} = await this.$http.post('cminfo/updateCminfo', this.editForm)
          if (res.status !== 200) {
            return this.$message.error('修改客户经理失败！')
          }
          this.$message.success('修改客户经理成功！')
          // 隐藏修改客户经理的对话框
          this.editDialogVisible = false
          // 重新获取客户经理列表数据
          this.getcmsList()
          this.reload()
        })
      },
      //点击按钮，删除单个客户经理
      async deleteCminfoById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除该客户经理, 是否继续?',
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
        const {data: result} = await this.$http.delete('cminfo/delCminfo/' + id)
        if (result.status !== 200) {
          return this.$message.error('删除客户经理失败！')
        }
        this.$message.success('删除客户经理成功！')
        this.getcmsList()
        this.reload()
      },
      //绑定多选值
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      //批量删除客户经理
      async delCminfos() {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm(
          '此操作将永久删除客户经理数据, 是否继续?',
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
        let checkArr = this.multipleSelection;   // multipleSelection存储了勾选到的数据
        let params = [];
        checkArr.forEach(function (item) {
          params.push(item.cmId);       // 添加所有需要删除数据的id到一个数组，post提交过去
        });
        //console.log(params)
        const {data: result} = await this.$http.delete('cminfo/delCminfos/' + params)
        if (result.status !== 200) {
          return this.$message.error('删除客户经理失败！')
        }
        this.$message.success('删除客户经理成功！')
        this.getcmsList()
        this.reload()
      },
      //部门数组随着单位数组联动
      bindJobName(jobName) {
        if (jobName === '支行') {
          this.depts = this.branchDept
        }
        if (jobName === '网点') {
          this.depts = this.outlets
        }
      },
      //籍贯选择后方法
      nativePlaceHandleChange(value) {
        console.log(this.selectNativePlace)
        this.addForm.cmHometown = CodeToText[value[0]] + "-" + CodeToText[value[1]] + "-" + CodeToText[value[2]]
        this.editForm.cmHometown = CodeToText[value[0]] + "-" + CodeToText[value[1]] + "-" + CodeToText[value[2]]
        //console.log(this.addForm.cmHometown)
      },
      //专业职称选择后方法
      technicalTitleHandleChange(value) {
        this.addForm.cmProfessionalTitles = value[0] + "-" + value[1]
        this.editForm.cmProfessionalTitles = value[0] + "-" + value[1]
        //console.log(this.addForm.cmProfessionalTitles)
      },
      openAddDialogVisible() {
        this.selectNativePlace = []
        this.technicalTitle = []
        this.addDialogVisible = true
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
