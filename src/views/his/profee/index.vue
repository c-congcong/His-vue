<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入关键字"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="项目类型" prop="projectType">
        <el-input
          v-model="queryParams.projectType"
          placeholder="请输入项目类型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="项目状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['his:profee:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['his:profee:modify']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['his:profee:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="doctorProjectFeeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="检查项目ID" align="center" prop="projectId" />
      <el-table-column label="项目名称" align="center" prop="projectName" />
      <el-table-column label="关键字" align="center" prop="keyword" />
      <el-table-column label="项目单价" align="center" prop="projectUnitprice" />
      <el-table-column label="项目成本" align="center" prop="projectCost" />
      <el-table-column label="项目单位" align="center" prop="projectTimes" />
      <el-table-column label="类别" align="center" prop="projectType" />
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['his:profee:modify']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['his:profee:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改检查费用对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" placeholder="项目类型" clearable size="small">
            <el-option
              v-for="dict in projectFeeTypes"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="form.keyword" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="项目费用" prop="projectUnitprice">
          <el-input v-model="form.projectUnitprice" placeholder="请输入项目费用" />
        </el-form-item>
        <el-form-item label="项目成本" prop="projectCost">
          <el-input v-model="form.projectCost" placeholder="请输入项目成本" />
        </el-form-item>
        <el-form-item label="项目单位" prop="projectTimes">
          <el-input v-model="form.projectTimes" placeholder="请输入项目单位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import { listProjectFee, addProjectFee, getDoctorProjectFee, updateDoctorProjectFee, delDoctorProjectFee } from "@/api/his/profee"

    export default {
        name: "DoctorDept",
        data() {
            return {
                // 遮罩层
                loading: true,
                // 选中数组
                ids: [],
                // 非单个禁用
                single: true,
                // 非多个禁用
                multiple: true,
                // 显示搜索条件
                showSearch: true,
                // 总条数
                total: 0,
                // 检查费用表格数据
                doctorProjectFeeList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 状态数据字典
                statusOptions: [],
                // 检查项目类型数据字典
                projectFeeTypes: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    projectName: undefined,
                    keyword: undefined,
                    projectType: undefined,
                    status: undefined
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    projectName: [
                        { required: true, message: "项目名称不能为空", trigger: "blur" }
                    ],
                    keyword: [
                        { required: true, message: "关键字不能为空", trigger: "blur" }
                    ],
                    projectTimes: [
                        { required: true, message: "项目单位不能为空", trigger: "blur" }
                    ],
                    projectUnitprice: [
                        { required: true, message: "项目单价不能为空", trigger: "blur" }
                    ],
                    projectCost: [
                        { required: true, message: "项目成本不能为空", trigger: "blur" }
                    ]
                }
            };
        },
        created() {
            this.getList();
            this.getDicts("sys_normal_disable").then(response => {
                this.statusOptions = response.data;
            });
            this.getDicts("his_project_fee_type").then(response => {
                this.projectFeeTypes = response.data;
            })
        },
        methods: {
            /** 查询检查费用列表 */
            getList() {
                this.loading = true;
                listProjectFee(this.queryParams).then(response => {
                    this.doctorProjectFeeList = response.rows; // 设置查询的当前页面数据集合
                    this.total = response.total; // 设置总计数据行数，实现分页
                    this.loading = false; // 关闭遮罩层。
                });
            },
            // 岗位状态字典翻译
            statusFormat(row, column) {
                return this.selectDictLabel(this.statusOptions, row.status);
            },
            // 取消按钮
            cancel() {
                this.open = false;
                this.reset();
            },
            // 表单重置
            reset() {
                this.form = {
                    projectId: undefined,
                    projectName: undefined,
                    keyword: undefined,
                    projectUnitprice: undefined,
                    projectCost: undefined,
                    projectTimes: undefined,
                    status: "0",
                    projectType: undefined
                };
                this.resetForm("form");
            },
            /** 搜索按钮操作 */
            handleQuery() {
                this.queryParams.pageNum = 1;
                this.getList();
            },
            /** 重置按钮操作 */
            resetQuery() {
                this.resetForm("queryForm");
                this.handleQuery();
            },
            // 多选框选中数据
            handleSelectionChange(selection) {
                this.ids = selection.map(item => item.projectId)
                this.single = selection.length!=1
                this.multiple = !selection.length
            },
            /** 新增按钮操作 */
            handleAdd() {
                this.reset();
                this.open = true;
                this.title = "添加检查费用";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                const projectId = row.projectId || this.ids
                getDoctorProjectFee(projectId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改检查费用";
                });
            },
            /** 提交按钮 */
            submitForm: function() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.projectId != undefined) {
                            updateDoctorProjectFee(this.form).then(response => {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addProjectFee(this.form).then(response => {
                                this.msgSuccess("新增成功");
                                this.open = false;
                                this.getList();
                            });
                        }
                    }
                });
            },
            /** 删除按钮操作 */
            handleDelete(row) {
                const projectIds = row.projectId || this.ids;
                this.$confirm('是否确认删除检查项目编号为"' + projectIds + '"的数据项?', "警告", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(function() {
                    return delDoctorProjectFee(projectIds);
                }).then(() => {
                    this.getList();
                    this.msgSuccess("删除成功");
                })
            }
        }
    };
</script>
