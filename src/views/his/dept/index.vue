<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="科室名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入科室名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="small">
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
          v-hasPermi="['his:dept:add']"
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
          v-hasPermi="['his:dept:edit']"
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
          v-hasPermi="['his:dept:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="科室ID" align="center" prop="deptId" />
      <el-table-column label="科室名称" align="center" prop="deptName" />
      <el-table-column label="科室编号" align="center" prop="deptCode" />
      <el-table-column label="挂号量" align="center" prop="deptNum" />
      <el-table-column label="负责人" align="center" prop="deptLeader" />
      <el-table-column label="电话" align="center" prop="deptPhoto" />
      <el-table-column label="状态" align="center" prop="status"  >
        <template slot-scope="scope">
          <span>{{ scope.row.status==1?"停用":"正常"}}</span>
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
            v-hasPermi="['his:dept:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['his:dept:remove']"
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

    <!-- 添加或修改科室对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="科室名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入科室名称" />
        </el-form-item>
        <el-form-item label="科室编码" prop="deptCode">
          <el-input v-model="form.deptCode" placeholder="请输入科室编码" />
        </el-form-item>
        <el-form-item label="负责人" prop="deptLeader">
          <el-input v-model="form.deptLeader" placeholder="请输负责人" />
        </el-form-item>
        <el-form-item label="电话" prop="deptPhone">
          <el-input v-model="form.deptPhone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="挂号量" prop="deptNum">
          <el-input-number v-model="form.deptNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="科室状态" prop="status">
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
import { listDept, getDept, delDept, addDept, updateDept, exportDept } from "@/api/his/dept";

export default {
  name: "Post",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: false,
      // 非多个禁用
      multiple: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 科室表格数据
      postList: [],
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
        postCode: undefined,
        deptName: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deptName: [
          { required: true, message: "科室名称不能为空", trigger: "blur" }
        ],
        deptCode: [
          { required: true, message: "科室编码不能为空", trigger: "blur" }
        ],
        deptNum: [
          { required: true, message: "挂号量不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();//查询所有数据
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询科室列表 */
    getList() {
      this.loading = true;
      listDept(this.queryParams).then(response => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 科室状态字典翻译
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
        deptName: undefined,
        deptCode: undefined,
        deptLeader: undefined,
        deptPhone:undefined,
        deptNum: 0,
        status: "0",
        remark: undefined
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
      this.ids = selection.map(item => item.deptId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加科室";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const deptId = row.deptId || this.ids
      getDept(deptId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改科室";
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDept(this.form).then(response => {
              console.log(response)
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
      const deptIds = row.deptId || this.ids;
      this.$confirm('是否确认删除科室编号为"' + deptIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delDept(deptIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有科室数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return exportDept(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
