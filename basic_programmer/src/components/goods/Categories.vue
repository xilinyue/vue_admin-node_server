<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--card-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateFormDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!--树形表格-->
            <el-table
                    :data="categoriesList"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="cat_id"
                    border
                    :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column
                        prop="cat_name"
                        label="分类名称"
                        min-width="200">
                </el-table-column>
                <el-table-column
                        label="是否有效"
                        min-width="200">
                    <template v-slot="scope">
                        <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
                        <i class="el-icon-error" style="color: red" v-else></i>
                    </template>
                </el-table-column>
                <el-table-column
                    label="排序"
                    min-width="200">
                    <template v-slot="scope">
                        <el-tag type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                        <el-tag type="danger" v-else>三级</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作"
                    min-width="200">
                    <template v-slot="scope">
                        <!--编辑-->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                    @click="editCateById(scope.row)">编辑</el-button>
                        <!--删除-->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                    @click="deleteCateById(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--分类-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 5, 10, 15]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加分类-->
        <el-dialog
                title="添加分类"
                :visible.sync="addCateDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="addCateDialogClosed">
            <el-form ref="addCateFormRef" :model="addCateForm" label-width="90px"
                     :rules="addCateFormRules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader
                            v-model="selectParentCate"
                            :options="parentCateList"
                            :props="parentProps"
                            clearable
                            @change="handleChange">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改分类-->
        <el-dialog
                title="修改"
                :visible.sync="editCateDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="editCateDialogClosed">
            <el-form ref="editCateFormRef" :model="editCateForm" label-width="90px"
                     :rules="addCateFormRules">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Categories",
        data(){
            return{
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                categoriesList: [],
                total: 0,
                addCateDialogVisible: false,
                addCateForm: {
                    cat_name: '',
                    cat_pid: 0,
                    cat_level: 0
                },
                addCateFormRules: {
                    cat_name: [
                        {required: true, message: '请输入分类名称', trigger: 'blur'}
                    ]
                },
                parentCateList: [],
                parentProps: {
                    expandTrigger: 'hover' ,
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children',
                    checkStrictly: true
                },
                selectParentCate: [],
                //修改分类
                editCateDialogVisible: false,
                editCateForm: {
                    cat_name: ''
                }
            }
        },
        created() {
            this.getCategoriesList();
        },
        methods: {
            getCategoriesList() {
                this.$http.get('categories', {params: this.queryInfo}).then((res) => {
                    let data = res.data;
                    if (data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                    }
                    this.categoriesList = data.data.result;
                    this.total = data.data.total
                })
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getCategoriesList();
            },
            handleCurrentChange(newNum) {
                this.queryInfo.pagenum = newNum;
                this.getCategoriesList();
            },
            //添加分类
            showAddCateFormDialog() {
                this.getParentCateList();
                this.addCateDialogVisible = true;
            },
            addCateDialogClosed() {
                this.$refs.addCateFormRef.resetFields();
                this.selectParentCate = [];
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            },
            getParentCateList() {
                this.$http.get('categories', {params: {type: 2}}).then((res) => {
                   let data = res.data;
                   if(data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                   }
                   this.parentCateList = data.data;
                });
            },
            handleChange() {
                let len = this.selectParentCate.length;
                if (len > 0) {
                    this.addCateForm.cat_pid = this.selectParentCate[len-1];
                    this.addCateForm.cat_level = len;
                    return;
                }else{
                    this.addCateForm.cat_pid = 0;
                    this.addCateForm.cat_level = 0;
                }
            },
            addCate() {
                this.$refs.addCateFormRef.validate(valid => {
                    if(valid){
                        this.$http.post('categories', this.addCateForm).then(res => {
                           let data = res.data;
                           if(data.meta.status !== 201){
                               return this.$message.error(data.meta.msg);
                           }
                           this.$message.success(data.meta.msg);
                           this.getCategoriesList();
                           this.addCateDialogVisible = false;
                        });
                    }
                })
            },
            //修改分类
            //根据id获取分类数据
            getCateById(id) {
                this.$http.get('categories/' + id).then((res) => {
                    let data = res.data;
                    if(data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                    }
                    this.editCateForm = data.data;
                });
            },
            editCateById(cate) {
                this.getCateById(cate.cat_id);
                this.editCateDialogVisible = true;
            },
            editCateDialogClosed() {
                this.$refs.editCateFormRef.resetFields();
            },
            editCate() {
                this.$refs.editCateFormRef.validate(valid => {
                    if(valid){
                        this.$http.put('categories/' + this.editCateForm.cat_id,
                        {cat_name: this.editCateForm.cat_name})
                        .then((res) => {
                            let data = res.data;
                            if(data.meta.status !== 200){
                                return this.$message.error(data.meta.msg);
                            }
                            this.getCategoriesList();
                            this.$message.success(data.meta.msg);
                            this.editCateDialogVisible = false;
                        })
                    }
                })
            },
            //删除分分类  categories/:id delete
            deleteCateById(cate){
                this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.delete('categories/' + cate.cat_id).then((res) => {
                        let data = res.data;
                        if (data.meta.status !== 200){
                            return this.$message.error('删除分类失败');
                        }
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getCategoriesList();
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            }
        }
    }
</script>

<style scoped>
    .el-cascader{
        width: 100%
    }
</style>