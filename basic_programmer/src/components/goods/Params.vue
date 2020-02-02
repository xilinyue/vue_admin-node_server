<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--card-->
        <el-card>
            <el-alert
                    title="注意：只允许为第三季分类设置相关参数"
                    type="warning" :closable="false"
                    show-icon>
            </el-alert>
            <el-row>
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader
                            v-model="selectKeys"
                            :options="cateList"
                            :props="cateProps"
                            @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!--动态参数-->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="isBtnDisabled"
                                @click="addDialogVisible = true">添加参数</el-button>
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index"
                                closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                            @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                            @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!--静态属性-->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" :disabled="isBtnDisabled"
                               @click="addDialogVisible = true">添加属性</el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index"
                                        closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                                <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini"
                                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                           @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!--添加参数-->
        <el-dialog
                :title="'添加' + titleText"
                :visible.sync="addDialogVisible"
                width="50%"
                @closed="addDialogClosed">
            <el-form ref="addFormRef" :model="addForm" label-width="80px"
                     :rules="addFormRules">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParam">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改参数-->
        <el-dialog
                :title="'修改' + titleText"
                :visible.sync="editDialogVisible"
                width="50%"
                @closed="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" label-width="80px"
                     :rules="addFormRules">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Params",
        data() {
            return {
                selectKeys: [],
                cateList: [],
                cateProps: {
                    expandTrigger: 'hover' ,
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                activeName: 'many',
                manyTableData: [],
                onlyTableData: [],
                //添加参数
                addDialogVisible: false,
                addForm: {
                    attr_name: ''
                },
                addFormRules: {
                    attr_name: [
                        {required: true, message: '请输入参数名称', trigger: 'blur'}
                    ]
                },
                //修改参数
                editDialogVisible: false,
                editForm: {}
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            //获取分类数据
            getCateList() {
                this.$http.get('categories').then((res) => {
                    let data = res.data;
                    if(data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                    }
                    this.cateList = data.data;
                });
            },
            //级联选择处理
            handleChange() {
                this.getParamsData();
            },
            //切换面板处理
            handleTabClick() {
                this.getParamsData();
            },
            //获取参数数据
            getParamsData() {
                let len = this.selectKeys.length;
                if(len !== 3){
                    this.selectKeys = [];
                    this.manyTableData = [];
                    this.onlyTableData = [];
                    return;
                }
                this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: { sel: this.activeName}
                }).then((res) => {
                   let data = res.data;
                   if (data.meta.status !== 200) {
                       return this.$message.error(data.meta.msg);
                   }
                   data.data.forEach(item => {
                       item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                       item.inputVisible = false;
                       item.inputValue = '';
                   });
                   if(this.activeName === 'many'){
                       this.manyTableData = data.data;
                   }else{
                       this.onlyTableData = data.data;
                   }
                });
            },
            //添加对话框关闭
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            //提交添加操做  categories/:id/attributes  attr_name attr_sel
            addParam() {
                this.$refs.addFormRef.validate(valid => {
                    if (valid){
                        this.$http.post(`categories/${this.cateId}/attributes`,{
                            attr_name: this.addForm.attr_name,
                            attr_sel: this.activeName
                        }).then((res) => {
                            let data = res.data;
                            if (data.meta.status !== 201){
                                return this.$message.error(data.meta.msg);
                            }
                            this.$message.success(data.meta.msg);
                            this.addDialogVisible = false;
                            this.getParamsData();
                        })
                    }
                })
            },
            //修改参数
            //弹出对话框并且获取需要修改的数据
            //  categories/:id/attributes/:attrId  get attr_sel
            async showEditDialog(attr_id) {
                //获取数据
                const { data : res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{
                    params: {attr_sel: this.activeName}
                });
                if(res.meta.status!==200) {
                    return this.$message.error(res.meta.msg);
                }

                this.editForm = res.data;

                this.editDialogVisible = true;
            },
            //关闭对话框reset EditForm
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            //提交修改  categories/:id/attributes/:attrId put attr_name attr_sel
            editParams() {
                this.$refs.editFormRef.validate(async valid=>{
                   if(!valid) return;
                    const {data: res} = await this.$http.put(
                        `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                        {attr_name: this.editForm.attr_name, attr_sel: this.activeName});
                    if(res.meta.status!==200){
                        return this.$message.error(res.meta.msg);
                    }
                    this.$message.success(res.meta.msg);
                    this.getParamsData();
                    this.editDialogVisible = false;
                });
            },
            //删除参数  categories/:id/attributes/:attrid  200
            async deleteParams(attr_id) {
                const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);
                if(confirmResult === 'cancel') {
                    return this.$message.info('已取消删除');
                }
                this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`).then((res) => {
                   let data = res.data;
                   if(data.meta.status !== 200) {
                       return this.$message.error(data.meta.msg);
                   }
                   this.$message.success(data.meta.msg);
                   this.getParamsData();
                });
            },
            //显示new tag input
            showInput(row) {
                row.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            //处理new tag的提交操作
            handleInputConfirm(row) {
                if(row.inputValue.trim().length === 0){
                    row.inputVisible = false;
                    row.inputValue = ''
                    return;
                }
                row.attr_vals.push(row.inputValue.trim());
                row.inputValue = '';
                row.inputVisible = false;
                //编辑提交参数
                this.saveAttributes(row);
            },
            //保存修改的参数到数据库
            async saveAttributes(row) {
                //categories/:id/attributes/:attrId
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                    {
                        attr_name: row.attr_name,
                        attr_sel: row.attr_sel,
                        attr_vals: row.attr_vals.join(' ')
                    });
                if (res.meta.status !== 200){
                    return this.$message.error(res.meta.msg);
                }
                this.$message.success(res.meta.msg);
            },
            //删除操作
            handleClose (i, row){
                row.attr_vals.splice(i,1);
                this.saveAttributes(row);
            }
        },
        computed: {
            isBtnDisabled() {
                if(this.selectKeys.length !== 3){
                    return true;
                }
                return false;
            },
            cateId() {
                let len = this.selectKeys.length;
                if(len === 3){
                    return this.selectKeys[len-1];
                }
                return null;
            },
            //添加参数对话框标题
            titleText() {
                if(this.activeName === 'many'){
                    return '动态参数';
                }
                return '静态属性';
            }
        }
    }
</script>

<style scoped>
    .el-row{
        margin: 10px 0;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag{
        width: 120px;
    }
</style>