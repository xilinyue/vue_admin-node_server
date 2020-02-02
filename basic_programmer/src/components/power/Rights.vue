<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="等级">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.level == 0">等级一</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level == 1">等级二</el-tag>
                        <el-tag type="warning" v-else>等级三</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Rights",
        data(){
            return{
                rightsList: [],
            }
        },
        created() {
            this.getRightsList();
        },
        methods: {
            getRightsList() {
                this.$http.get('rights/list').then((res) => {
                   let data = res.data;
                   if(data.meta.status !== 200){
                       return this.$message.error('获取权限列表失败');
                   }
                   this.rightsList = data.data;
                });
            }
        }
    }
</script>

<style scoped>

</style>