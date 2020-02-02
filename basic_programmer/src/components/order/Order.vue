<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--card视图-->
        <el-card>
            <el-row>
                <el-col :span="12">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search" @click="searchOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!--table表格区域-->
            <el-table :data="orderList" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" width="100px" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" width="100px" prop="pay_status">
                    <!--pay_status0未付款，1已付款-->
                    <template v-slot="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" width="100px" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" width="200px">
                    <template v-slot="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="editAddressDialogVisible = true" size="mini"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressDialog"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[5, 10, 15, 20]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--修改地址对话框-->
        <el-dialog
                title="修改地址"
                :visible.sync="editAddressDialogVisible"
                width="50%">
            <el-form :model="editAddressForm" :rules="editAddressFormRules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                            v-model="editAddressForm.address1"
                            :options="cityData"
                            :props="{ expandTrigger: 'hover' }"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editAddressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editAddressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAddress">确 定</el-button>
            </span>
        </el-dialog>
        <!--快递信息-->
        <el-dialog
                title="查看物流进度"
                :visible.sync="progressDialogVisible"
                width="50%">
            <el-timeline>
                <el-timeline-item
                        v-for="(activity, index) in progressInfo"
                        :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
    import cityData from'./citydata'
    export default {
        name: "Order",
        data(){
            return{
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                orderList: [],
                total: 0,
                cityData: cityData,
                editAddressDialogVisible: false,
                editAddressForm: {
                    address1: [],
                    address2: ''
                },
                editAddressFormRules: {
                    address1: [
                        { required: true, message: '请选择省市/县', trigger: 'blur'}
                    ],
                    address2: [
                        { required: true, message: '请填写详细地址', trigger: 'blur'}
                    ]
                },
                progressInfo: [],
                progressDialogVisible: false,
            }
        },
        created() {
            this.getOrderList();
        },
        methods: {
            async getOrderList() {
                const {data: res} = await this.$http.get('orders', {
                    params: this.queryInfo
                });
                if(res.meta.status !== 200){
                    return this.$message.error(res.meta.msg);
                }
                this.orderList = res.data.goods;
                this.total = res.data.total;
            },
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize;
                this.getOrderList();
            },
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage;
                this.getOrderList();
            },
            searchOrderList() {
                this.getOrderList();
            },
            editAddress() {
                this.$refs.ruleForm.validate(valid => {
                   if(valid) {
                       this.$refs.ruleForm.resetFields();
                       this.editAddressDialogVisible = false;
                   }
                });

            },
            //获取物流信息
            getProgressInfo() {
                this.$http.get('kuaidi/1106975712662').then((res) => {
                   let data = res.data;
                   if(data.meta.status !== 200){
                       return this.$message.error(data.meta.msg);
                   }
                   this.progressInfo = data.data;
                });
            },
            showProgressDialog() {
                this.getProgressInfo();
                this.progressDialogVisible = true;
            }
        }
    }
</script>

<style scoped>

</style>