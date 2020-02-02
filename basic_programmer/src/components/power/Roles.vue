<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['vCenter','rowBottom',i1===0 ? 'rowTop' : '']">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="['vCenter',i2===0 ? '' : 'rowTop']">
                                    <el-col :span="6">
                                        <el-tag type="success"
                                                closable @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id"
                                                closable @close="removeRightsById(scope.row,item3.id)">{{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <!--修改  -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialog(scope.row)"></el-button>
                        <!-- 删除 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="deleteRoleById(scope.row.id)"></el-button>
                        <!-- 分配角色 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightsDialog(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <el-dialog
                title="分配权限"
                :visible.sync="setRightsDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="setRightsDialogClosed">
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
                default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="alotRights">确 定</el-button>
            </span>
        </el-dialog>
        <!--添加角色-->
        <el-dialog
                title="添加角色"
                :visible.sync="addDialogVisible"
                width="50%"
                :close-on-click-modal="false"
                @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addForm" label-width="80px"
                     :rules="addFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改角色-->
        <el-dialog
                title="修改角色"
                :visible.sync="editDialogVisible"
                width="50%"
                :close-on-click-modal="false">
            <el-form ref="editFormRef" :model="editForm" label-width="80px"
                     :rules="addFormRules">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Roles",
        data(){
            return{
                rolesList: [],
                setRightsDialogVisible: false,
                rightsList: [],
                treeProps: {
                    children: 'children',
                    label: 'authName'
                },
                defKeys: [],
                roleId: 0,
                addDialogVisible: false,
                addForm: {
                    roleName: '',
                    roleDesc: ''
                },
                addFormRules: {
                    roleName: [
                        {required: true, message: '角色名称不可以为空', trigger: 'blur'}
                    ],
                },
                editDialogVisible: false,
                editForm: {

                }
            }
        },
        created() {
            this.getRolesList();
        },
        methods: {
            getRolesList() {
                this.$http.get('roles').then((res) => {
                   let data = res.data;
                   if (data.meta.status !== 200){
                       return this.$message.error(data.meta.msg);
                   }
                    this.rolesList = data.data;
                });
            },
            //根据id删除权限
            removeRightsById(role,id){
                this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.delete(`roles/${role.id}/rights/${id}`).then((res) => {
                        let data = res.data;
                        if (data.meta.status !== 200){
                            return this.$message.error('删除角色权限失败');
                        }
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        // this.getUserList();
                        // console.log(data.data);
                        role.children = data.data;
                        // console.log(role);
                    });
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            showSetRightsDialog(role){
                this.roleId = role.id;
                this.getRightsList();
                this.getLeafKeys(role,this.defKeys);
                this.setRightsDialogVisible = true;
            },
            setRightsDialogClosed() {
                this.defKeys = []
            },
            //获取分配权限数据
            async getRightsList() {
                const {data : res} = await this.$http.get('rights/tree');
                if (res.meta.status !== 200){
                    return this.$message.error('获取权限数据失败');
                }
                this.rightsList = res.data;

            },
            getLeafKeys(node, arr) {
                if (!node.children){
                    return arr.push(node.id);
                }
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr);
                });
            },
            alotRights() {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ];
                const idStr = keys.join(',');
                this.$http.post(`roles/${this.roleId}/rights`, { rids : idStr}).then((res) => {
                   let data = res.data;
                   if (data.meta.status !== 200){
                       return this.$message.error('角色授权失败');
                   }
                   this.$message.success(data.meta.msg);
                   this.getRolesList();
                   this.setRightsDialogVisible = false;
                });
            },
            addDialogClosed() {
                this.addDialogVisible = false;
                this.addForm = {
                    roleName: '',
                    roleDesc: ''
                }
            },
            addRole() {
                this.$refs.addFormRef.validate(valid => {
                   if(valid){
                       this.$http.post('roles', this.addForm).then( (res) => {
                           let data = res.data;
                           if( data.meta.status !== 201){
                               return this.$message.error(data.meta.msg);
                           }
                           this.$message.success(data.meta.msg);
                           this.addDialogVisible = false;
                           this.getRolesList();
                       });
                   }
                });
            },
            editDialog(role) {
              //根据id获取角色信息
                this.$http.get('roles/'+role.id).then((res) => {
                    let data = res.data;
                    if(data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                    }
                    this.editForm = data.data;
                });
              //打开对话框
                this.editDialogVisible = true;
            },
            editRole() {
                this.$refs.editFormRef.validate(valid => {
                    if(valid){
                        this.$http.put('roles/'+this.editForm.roleId,
                        {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc}
                        ).then((res) => {
                           let data = res.data;
                           if(data.meta.status!==200){
                               return this.$message.error(data.meta.msg);
                           }
                           this.$message.success(data.meta.msg);
                           this.getRolesList();
                           this.editDialogVisible = false;
                        });
                    }
                });
            },
            deleteRoleById(id){
                this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.delete('roles/'+id).then((res) => {
                        let data = res.data;
                        if (data.meta.status !== 200){
                            return this.$message.error('删除用户失败');
                        }
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getRolesList();
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
    .el-tag{
        margin: 7px;
    }
    .rowTop{
        border-top: 1px solid #eee;
    }
    .rowBottom{
        border-bottom: 1px solid #eee;
    }
    .vCenter {
        display: flex;
        align-items: center;
    }
</style>