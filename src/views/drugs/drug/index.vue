<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="药品名称" prop="durgName">
        <el-input
          v-model="queryParams.durgName"
          placeholder="请输入药品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="药品编码" prop="durgCode">
        <el-input
          v-model="queryParams.durgCode"
          placeholder="请输入药品编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="药品类型" prop="durgType">
        <el-input
          v-model="queryParams.durgType"
          placeholder="请输入药品类型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="处方类型" prop="durgOtcType">
        <el-input
          v-model="queryParams.durgOtcType"
          placeholder="请输入处方类型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="durgStatus">
        <el-select v-model="queryParams.durgStatus" placeholder="项目状态" clearable size="small">
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
          v-hasPermi="['drugs:drug:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['drugs:drug:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="drugList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="药品ID" align="center" prop="durgId" />
      <el-table-column label="药品名称" align="center" prop="durgName" />
      <el-table-column label="药品编码" align="center" prop="durgCode" />
      <el-table-column label="生产厂家" align="center" prop="producer.proName" />
      <el-table-column label="药品类型" align="center" prop="durgType" />
      <el-table-column label="处方类型" align="center" prop="durgOtcType" />
      <el-table-column label="单位" align="center" prop="durgUnit" />
      <el-table-column label="处方价格" align="center" prop="durgOtcPrice" />
      <el-table-column label="库存量" align="center" prop="durgNumber" />
      <el-table-column label="预警量" align="center" prop="durgNumberMin" />
      <el-table-column label="换算量" align="center" prop="durgConvert" />
      <el-table-column label="状态" align="center" prop="durgStatus" :formatter="statusFormat" />
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
            v-hasPermi="['drugs:drug:modify']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['his:profee:modify']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['drugs:drug:remove']"
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

    <!-- 添加或修改药品信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="药品名称" prop="durgName">
              <el-input v-model="form.durgName" placeholder="请输入药品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="药品编码" prop="durgCode">
              <el-input v-model="form.durgCode" placeholder="请输入药品编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="药品类型" prop="durgType">
              <el-input v-model="form.durgType" placeholder="请输入药品类型"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处方类型" prop="durgOtcType">
              <el-input v-model="form.durgOtcType" placeholder="请输入处方类型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单位" prop="durgUnit">
              <el-input v-model="form.durgUnit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处方价格" prop="durgOtcPrice">
              <el-input v-model="form.durgOtcPrice" placeholder="请输入处方价格" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="换算量" prop="durgConvert">
              <el-input v-model="form.durgConvert" placeholder="请输入换算量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存量" prop="durgNumber">
              <el-input v-model="form.durgNumber" placeholder="请输入库存量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="预警值" prop="durgNumberMin">
              <el-input v-model="form.durgNumberMin" placeholder="请输入预警值" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产厂家">
              <el-select v-model="form.durgProducer" placeholder="请选择">
                <el-option
                  v-for="item in drugProducerList"
                  :key="item.proId"
                  :label="item.proName"
                  :value="item.proId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态">
              <el-radio-group v-model="form.durgStatus">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import { listDrug, getAllDrugProducers, addDrug, getDrug, updateDrug, delDrugs } from "@/api/drugs/drug"

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
                // 药品信息表格数据
                drugList: [],
                // 生产厂家集合
                drugProducerList: [],
                // 弹出层标题
                title: "",
                // 是否显示弹出层
                open: false,
                // 状态数据字典
                statusOptions: [],
                // 查询参数
                queryParams: {
                    pageNum: 1,
                    pageSize: 10,
                    durgName: undefined,
                    durgCode: undefined,
                    durgType: undefined,
                    durgOtcType: undefined,
                    durgStatus: undefined
                },
                // 表单参数
                form: {},
                // 表单校验
                rules: {
                    durgName: [
                        { required: true, message: "药品名称不能为空", trigger: "blur" }
                    ],
                    durgCode: [
                        { required: true, message: "药品编码不能为空", trigger: "blur" }
                    ]
                }
            };
        },
        created() {
            this.getList();
            this.getDicts("sys_normal_disable").then(response => {
                this.statusOptions = response.data;
            });
        },
        methods: {
            /** 查询检查费用列表 */
            getList() {
                this.loading = true;
                listDrug(this.queryParams).then(response => {
                    this.drugList = response.rows; // 设置查询的当前页面数据集合
                    this.total = response.total; // 设置总计数据行数，实现分页
                    this.loading = false; // 关闭遮罩层。
                });
            },
            // 岗位状态字典翻译
            statusFormat(row, column) {
                // 第一个参数是数据字典集合。 第二个参数是对应的属性名称
                return this.selectDictLabel(this.statusOptions, row.durgStatus);
            },
            // 取消按钮
            cancel() {
                this.open = false;
                this.reset();
            },
            // 表单重置
            reset() {
                this.form = {
                    durgId: undefined,
                    durgName: undefined,
                    durgCode: undefined,
                    durgProducer: undefined,
                    durgType: undefined,
                    durgOtcType: undefined,
                    durgUnit: undefined,
                    durgOtcPrice: 0,
                    durgNumber: 0,
                    durgNumberMin: 0,
                    durgConvert: undefined,
                    durgStatus: "0"
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
                this.ids = selection.map(item => item.durgId)
                this.single = selection.length!=1
                this.multiple = !selection.length
            },
            /** 新增按钮操作 */
            handleAdd() {
                this.reset();
                // 查询全部生产厂家，并赋值给集合drugProducerList。
                getAllDrugProducers().then(response => {
                    // 把查询的结果集合赋值给变量drugProducerList
                    this.drugProducerList = response.data;
                });
                this.open = true;
                this.title = "添加药品信息";
            },
            /** 修改按钮操作 */
            handleUpdate(row) {
                this.reset();
                // 查询全部生产厂家，并赋值给集合drugProducerList。
                getAllDrugProducers().then(response => {
                    // 把查询的结果集合赋值给变量drugProducerList
                    this.drugProducerList = response.data;
                });
                const durgId = row.durgId || this.ids
                getDrug(durgId).then(response => {
                    this.form = response.data;
                    this.open = true;
                    this.title = "修改药品信息";
                });
            },
            /** 提交按钮 */
            submitForm: function() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        if (this.form.durgId != undefined) {
                            updateDrug(this.form).then(response => {
                                this.msgSuccess("修改成功");
                                this.open = false;
                                this.getList();
                            });
                        } else {
                            addDrug(this.form).then(response => {
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
                const durgId = row.durgId || this.ids;
                this.$confirm('是否确认删除药品信息编号为"' + durgId + '"的数据项?', "警告", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(function() {
                    return delDrugs(durgId);
                }).then(() => {
                    this.getList();
                    this.msgSuccess("删除成功");
                })
            }
        }
    };
</script>
