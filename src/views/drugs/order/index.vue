<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="供应商" prop="supportName">
        <el-input
          v-model="queryParams.supportName"
          placeholder="请输入供应商"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请人" prop="orderMan">
        <el-input
          v-model="queryParams.orderMan"
          placeholder="请输入申请人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="明细状态" prop="detailStatus">
        <el-select v-model="queryParams.detailStatus" placeholder="明细状态" clearable size="small">
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
          v-hasPermi="['drugs:order:add']"
        >新增采购订单
            <!--<router-link :to="'/drugs/order/addOrder'" class="link-type">
              <span>新增采购订单</span>
            </router-link>-->
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-plus"
          size="mini"
          :disabled="examineDisabled"
          @click="handleExamine"
          v-hasPermi="['drugs:order:examine']"
        >提交审核</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="cancelDisabled"
          @click="handleCancel"
          v-hasPermi="['drugs:order:cancel']"
        >作废</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-plus"
          size="mini"
          :disabled="storageDisabled"
          @click="handleStorage"
          v-hasPermi="['drugs:order:storage']"
        >提交入库</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderAndOthersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="单据ID" align="center" prop="orderId" />
      <el-table-column label="供应商" align="center" prop="supportName" />
      <el-table-column label="药品名称" align="center" prop="durgName" />
      <el-table-column label="药品批次" align="center" prop="detailBathNum" />
      <el-table-column label="批次总额" align="center" prop="detailTotalPrice" />
      <el-table-column label="状态" align="center" prop="detailStatus" :formatter="statusFormat" />
      <el-table-column label="申请人" align="center" prop="orderMan" />
      <el-table-column label="入库操作人" align="center" prop="detailOperator" />
      <el-table-column label="备注" align="center" prop="detailRemarks" />
      <el-table-column label="入库时间" align="center" prop="detailDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.detailDate) }}</span>
        </template>
      </el-table-column>
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
    import { getAllDrugProducers, addDrug, getDrug, updateDrug, delDrugs } from "@/api/drugs/drug"
    import { listOrderAndOthers, submitExamine, submitCancel, submitStorage } from "@/api/drugs/order"

    export default {
        name: "DoctorDept",
        data() {
            return {
                // 遮罩层
                loading: true,
                // 提交审核按钮是否不可用
                examineDisabled: true,
                // 作废按钮是否不可用
                cancelDisabled: true,
                // 提交入库按钮是否不可用
                storageDisabled: true,
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
                // 采购入库单表格数据
                orderAndOthersList: [],
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
                    supportName: undefined,
                    orderMan: undefined,
                    detailStatus: undefined
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
            // 查询采购入库单状态数据字典。
            this.getDicts("drug_order_detail_status").then(response => {
                this.statusOptions = response.data;
            });
        },
        methods: {
            /** 查询检查费用列表 */
            getList() {
                this.loading = true;
                listOrderAndOthers(this.queryParams).then(response => {
                    this.orderAndOthersList = response.rows; // 设置查询的当前页面数据集合
                    this.total = response.total; // 设置总计数据行数，实现分页
                    this.loading = false; // 关闭遮罩层。
                });
            },
            // 岗位状态字典翻译
            statusFormat(row, column) {
                // 第一个参数是数据字典集合。 第二个参数是对应的属性名称
                return this.selectDictLabel(this.statusOptions, row.detailStatus);
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
                this.ids = selection.map(item => item.detailId)
                this.single = selection.length!=1
                this.multiple = !selection.length
                // 判断选中的若干行数据的状态，决定是否可以点击 提交审核、作废、提交入库 按钮。
                let isExam = 0; // 状态是待审核、审核失败、审核成功、已入库、作废，都不能提交审核， isExam++
                let isCancel = 0; // 状态是待审核、审核成功、已入库、作废，都不能作废， isCancel++
                let isStorage = 0; // 状态是未申请、待审核、审核失败、已入库、作废，都不能提交入库， isStorage++
                // alert(selection.length + "   " + isExam + "    " + isCancel + "     " + isStorage)
                selection.map(item => {
                    // 循环选中的若干行。
                    if(item.detailStatus == 0){
                        // 未申请状态
                        isStorage++;
                    }
                    if(item.detailStatus == 1){
                        // 待审核状态
                        isExam++;
                        isCancel++;
                        isStorage++;
                    }
                    if(item.detailStatus == 2){
                        // 审核失败状态
                        isExam++;
                        isStorage++
                    }
                    if(item.detailStatus == 3){
                        // 审核成功状态
                        isExam++;
                        isCancel++;
                    }
                    if(item.detailStatus == 4){
                        // 已入库
                        isExam++;
                        isCancel++;
                        isStorage++;
                    }
                    if(item.detailStatus == 5){
                        // 作废
                        isExam++;
                        isCancel++;
                        isStorage++;
                    }
                });
                // 判断是否可以点击提交审核、作废、提交入库按钮
                if(selection.length > 0) {
                    this.examineDisabled = (isExam != 0)
                    this.cancelDisabled = (isCancel != 0)
                    this.storageDisabled = (isStorage != 0)
                }else{ // 未选择任何行数据，所有按钮不可点击。
                    this.examineDisabled = true
                    this.cancelDisabled = true
                    this.storageDisabled = true
                }
            },
            /** 新增按钮操作 */
            handleAdd() {
                // 打开一个新的页面
                this.$router.push({path: '/drugs/order/addOrder'});
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
            /** 提交审核 */
            handleExamine(){
                // 获取选中的所有行数据的主键，并使用此数据作为参数，访问后端服务。
                submitExamine(this.ids).then(response => {
                    this.msgSuccess("提交审核成功")
                    this.getList() // 重新查询采购单据列表
                });
            },
            /** 作废 */
            handleCancel(){
                submitCancel(this.ids).then(response => {
                    this.msgSuccess("作废成功")
                    this.getList()
                });
            },
            /** 提交入库 */
            handleStorage(){
                submitStorage(this.ids).then(response => {
                    this.msgSuccess("提交入库成功")
                    this.getList()
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
