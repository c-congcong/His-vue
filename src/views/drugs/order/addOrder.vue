<template>
  <div class="app-container">
    <el-form :model="form" ref="form" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="总批发额" prop="orderTotal">
        <el-input
          v-model="orderTotal"
          size="small"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="供应商" prop="supportId">
        <el-select v-model="form.supportId" @change="changeSupport" placeholder="供应商" clearable size="small">
          <el-option
            v-for="dict in drugsSupportList"
            :key="dict.supportId"
            :label="dict.supportName"
            :value="dict.supportId"
          />
        </el-select>
      </el-form-item>
      <!--<el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>-->
    </el-form>

    <el-row :gutter="24" class="mb8">
      <el-col :offset="18" :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['drugs:drug:add']"
        >添加药品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-s-order"
          size="mini"
          @click="handleSubmit"
          v-hasPermi="['drugs:drug:add']"
        >暂存</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-circle-check"
          size="mini"
          @click="handleSubmit"
          v-hasPermi="['drugs:drug:remove']"
        >提交审核</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" v-model="orderDetailList" :data="orderDetailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="行ID" align="center" type="index" />
      <el-table-column label="药品ID" align="center" prop="durgId" />
      <el-table-column label="药品名称" align="center" prop="durgName" />
      <el-table-column label="药品编码" align="center" prop="durgCode" />
      <el-table-column label="生产厂家" align="center" prop="producer.proName" />
      <el-table-column label="进药数量" align="center" prop="detailDrugNum" >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.detailDrugNum"
            size="small"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center" prop="durgUnit" />
      <el-table-column label="批发单价" align="center" prop="detailDrugPrice" >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.detailDrugPrice"
            size="small"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="批发总额" align="center" prop="detailTotalPrice" >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.detailTotalPrice"
            size="small"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="批次号" align="center" prop="detailBathNum" >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.detailBathNum"
            size="small"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="detailRemarks" >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.detailRemarks"
            size="small"
            :disabled="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleModifyDetail(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleDeleteDetail(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加采购单药品信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-table v-loading="loading" :data="drugBySupportList" @selection-change="handleDrugSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="药品ID" align="center" prop="durgId" />
        <el-table-column label="药品名称" align="center" prop="durgName" />
        <el-table-column label="药品编码" align="center" prop="durgCode" />
        <el-table-column label="生产厂家" align="center" prop="producer.proName" />
        <el-table-column label="药品类型" align="center" prop="durgType" />
        <el-table-column label="处方类型" align="center" prop="durgOtcType" />
        <el-table-column label="单位" align="center" prop="durgUnit" />
      </el-table>
      <pagination
        v-show="drugBySupportTotal>0"
        :total="drugBySupportTotal"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getAllDrugSupport"
      />
    </el-dialog>

    <el-dialog :title="title" :visible.sync="orderDetailOpen" width="600px" append-to-body>
      <el-form ref="orderDetail" :model="orderDetail" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="药品名称" prop="durgName">
              <el-input v-model="orderDetail.durgName" placeholder="请输入药品名称" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="药品编码" prop="durgCode">
              <el-input v-model="orderDetail.durgCode" placeholder="请输入药品编码" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="进药数量" prop="detailDrugNum">
              <el-input v-model="orderDetail.detailDrugNum" placeholder="请输入进药数量" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="批发单价" prop="detailDrugPrice">
              <el-input v-model="orderDetail.detailDrugPrice" placeholder="请输入批发单价" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="批次号" prop="detailBathNum">
              <el-input v-model="orderDetail.detailBathNum" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="备注" prop="detailRemarks">
              <el-input v-model="orderDetail.detailRemarks" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormOrderDetail">确 定</el-button>
        <el-button @click="cancelOrderDetail">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import { getAllDrugProducers, addDrug, getDrug, updateDrug, delDrugs, getDrugBySupportId } from "@/api/drugs/drug"
    import { listOrderAndOthers } from "@/api/drugs/order"
    import { getAllDrugSupports, addDrugOrderAndDetails } from "@/api/drugs/addOrder"
    import {deepClone} from "../../../utils";

    export default {
        name: "AddOrder",
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
                // 根据供应商查询的药品集合于数据总数
                drugBySupportList:[],
                drugBySupportTotal: 0,
                // 当前供应商主键
                currSupportId: 0,
                // 采购入库单明细表格数据
                orderDetailList: [],
                // 生产厂家集合
                drugProducerList: [],
                // 供应商集合
                drugsSupportList: [],
                // 正在编辑的采购单明细
                orderDetail: {},
                // 总批发额
                orderTotal: 0,
                orderDetailOpen: false, // 采购单明细对话框是否打开。默认关闭。
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
            //this.getList();
            // 访问后端应用，查询所有供应商，赋值给drugsSupportList
            this.getAllDrugSupport();
            // 查询采购入库单状态数据字典。
            this.getDicts("drug_order_detail_status").then(response => {
                this.statusOptions = response.data;
            });
        },
        methods: {
            /** 提交采购订单 */
            handleSubmit(){
                // 获取要提交的所有参数，并调用访问访问远程服务器。
                // 供应商主键
                let supportId = this.form.supportId;
                // 总额
                let orderTotal = this.orderTotal;
                // 所有的单据明细集合
                let orderDetailList = deepClone(this.orderDetailList);
                // 修改细致的数据
                orderDetailList.map(item => {
                    item.detailStatus = 0;
                    item.detailDrugid = item.durgId;
                    item.detailNorms = '';
                })
                addDrugOrderAndDetails(supportId, orderTotal, orderDetailList).then(response => {
                    this.msgSuccess("新增成功");
                    this.reset();
                    this.resetOrderDetail();
                    this.orderTotal = 0;
                    this.orderDetailList = [];
                });
            },
            handleModifyDetail(row){
                this.resetOrderDetail();
                // 打开一个对话框，显示当前行信息，并提供可修改的处理逻辑。
                this.orderDetail.durgId = row.durgId;
                this.orderDetail.durgName = row.durgName;
                this.orderDetail.durgCode = row.durgCode;
                this.orderDetail.detailDrugNum = row.detailDrugNum;
                this.orderDetail.detailDrugPrice = row.detailDrugPrice;
                this.orderDetail.detailTotalPrice = row.detailTotalPrice;
                this.orderDetail.detailBathNum = row.detailBathNum;
                this.orderDetail.detailRemarks = row.detailRemarks;
                this.orderDetailOpen = true;
            },
            handleDrugSelectionChange(selection){
                // 选择行数据，把选择的行数据增加到底层数据表格中。
                // 参数是选中的所有行
                // this.orderDetailList = selection;
                this.orderDetailList = deepClone(selection);
                for(var i = 0; i < this.orderDetailList.length; i++){
                    this.orderDetailList[i].detailRemarks = '';
                    this.orderDetailList[i].detailDrugNum = 0;
                    this.orderDetailList[i].detailDrugPrice = 0;
                    this.orderDetailList[i].detailTotalPrice = 0;
                    this.orderDetailList[i].detailBathNum = 0;
                }
            },
            changeSupport(supportId) {
                // 判断，选择的供应商和当前供应商是否一致。如果不同，清空底层表格。如果相同不做操作。
                if(supportId != this.currSupportId){
                    // 清空低层表格
                    this.orderDetailList = [];
                }
                // 记录当前供应商主键
                this.currSupportId = supportId;
                // 选择不同的供应商处理函数。
                // 根据选择的供应商主键，查询供应商可供应的所有药品。
                // drugs_support供应商  drugs_pro_sup供应商和生产厂商关系 drugs_durg药品
                this.getDrugListBySupportId(supportId);
                this.open = true;
                this.title = "药品信息列表";
            },
            getAllDrugSupport() {
                this.loading = true;
                getAllDrugSupports().then(response => {
                    this.drugsSupportList = response.data; // 设置所有的供应商列表
                    this.loading = false; // 关闭遮罩层。
                })
            },
            /** 根据供应商主键查询药品集合 */
            getDrugListBySupportId(supportId) {
                this.loading = true;
                getDrugBySupportId(supportId).then(response => {
                    this.drugBySupportList = response.rows;// 设置查询的当前页面数据集合
                    this.drugBySupportTotal = response.total;// 设置总计数据行数，实现分页
                    this.loading = false;// 关闭遮罩层。
                })
            },
            /** 查询检查费用列表 */
            getList() {
                this.loading = true;
                listOrderAndOthers(this.queryParams).then(response => {
                    this.orderDetailList = response.rows; // 设置查询的当前页面数据集合
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
            // 采购单明细取消按钮
            cancelOrderDetail(){
                this.orderDetailOpen = false;
                this.resetOrderDetail();
            },
            // 表单重置
            reset() {
                this.form = {
                    supportId: undefined,
                    supportName: undefined
                };
                this.resetForm("form");
            },
            // 重置采购单明细表单
            resetOrderDetail() {
                this.orderDetail = {
                    durgId: undefined,
                    durgName: undefined,
                    durgCode: undefined,
                    detailDrugNum: undefined,
                    detailDrugPrice: undefined,
                    detailTotalPrice: undefined,
                    detailBathNum: undefined,
                    detailRemarks: undefined
                };
                this.resetForm("orderDetail");
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
            /** 采购单明细表单提交按钮 */
            submitFormOrderDetail: function(){
                // 把修改后的数据保存到底层数据位置。
                let temp = deepClone(this.orderDetailList);
                let tempTotal = 0;
                for(let i = 0; i < temp.length; i++){
                    if(temp[i].durgId == this.orderDetail.durgId){
                        // 找到修改的药品信息。把修改后的数据回填
                        temp[i].detailDrugNum = this.orderDetail.detailDrugNum
                        temp[i].detailDrugPrice = this.orderDetail.detailDrugPrice
                        temp[i].detailBathNum = this.orderDetail.detailBathNum
                        temp[i].detailRemarks = this.orderDetail.detailRemarks
                        temp[i].detailTotalPrice = this.orderDetail.detailDrugNum * this.orderDetail.detailDrugPrice
                        tempTotal += this.orderDetail.detailDrugNum * this.orderDetail.detailDrugPrice
                    }else{
                        tempTotal += temp[i].detailTotalPrice
                    }
                }
                this.orderDetailList = temp;
                this.orderTotal = tempTotal;

                this.orderDetailOpen = false; // 关闭对话框
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
