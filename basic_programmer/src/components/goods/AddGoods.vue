<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <el-steps align-center :active="activeIndex - 0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormRules"
                     ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :tab-position="'left'" v-model="activeIndex"
                         @tab-click="handleTabClick" :before-leave="beforeLeave">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number" min="0"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number" min="0"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number" min="0"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                    v-model="addForm.goods_cat"
                                    :options="cateList"
                                    :props="casterProps"
                                    @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="(item, i) in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="attr_val" border v-for="(attr_val,i) in item.attr_vals" :key="i"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload action="http://127.0.0.1:8888/api/private/v1/upload"
                                :on-preview="handlePreview"
                                :on-remove="handleRemove"
                                :headers="headersObj"
                                :on-success="handleSuccess"
                                list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!--图片预览-->
        <el-dialog
                title="图片预览"
                :visible.sync="previewVisible"
                width="50%">
            <img :src="imgPreviewPath" alt="" class="img_preview">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash';
    export default {
        name: "AddGoods",
        data() {
            return{
                activeIndex: '0',
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_number: 0,
                    goods_weight: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce: '',
                    attrs: []
                },
                addFormRules: {
                    goods_name: [
                        {required: true, message: '请输入商品名称', trigger: 'blur'}
                    ],
                    goods_price: [
                        {required: true, message: '请输入商品价格', trigger: 'blur'}
                    ],
                    goods_number: [
                        {required: true, message: '请输入商品数量', trigger: 'blur'}
                    ],
                    goods_weight: [
                        {required: true, message: '请输入商品重量', trigger: 'blur'}
                    ],
                    goods_cat: [
                        {required: true, message: '请选择商品分类', trigger: 'blur'}
                    ]
                },
                cateList: [],
                casterProps: {
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                manyTableData: [],
                onlyTableData: [],
                headersObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                previewVisible: false,
                imgPreviewPath: '',
            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            getCateList(){
                this.$http.get('categories').then((res) => {
                    let data = res.data;
                    if(data.meta.status !== 200){
                        return this.$message.error(data.meta.msg);
                    }
                    this.cateList = data.data;
                });
            },
            handleChange(){
                let len = this.addForm.goods_cat.length;
                if(len !== 3){
                    this.addForm.goods_cat = []
                }
            },
            //阻止tab在不满足条件时的切换
            beforeLeave(nextActiveName, oldActiveName) {
                if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                    this.$message.error('请选择商品分类');
                    return false;
                }
            },
            //处理tabs点击事件
            handleTabClick() {
                if(this.activeIndex === '0'){

                }else if (this.activeIndex === '1'){
                    this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: {sel: 'many'}
                    }).then((res) => {
                       let data = res.data;
                       if(data.meta.status !== 200){
                           return this.$message.error(data.meta.msg);
                       }
                       data.data.forEach(item => {
                          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                       });
                       this.manyTableData = data.data;

                    });
                }else if(this.activeIndex === '2'){
                    this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: {sel: 'only'}
                    }).then((res) => {
                        let data = res.data;
                        if(data.meta.status !== 200){
                            return this.$message.error(data.meta.msg);
                        }
                        this.onlyTableData = data.data;

                    });
                }
            },
            handlePreview(file) {
                //file.response.data.url
                this.imgPreviewPath = file.response.data.url;
                this.previewVisible = true;
            },
            handleRemove(file) {
                //从addForm中删除相关的pics
                //file.response.data.tmp_path
                const path = file.response.data.tmp_path;
                let index = this.addForm.pics.findIndex(pic => {
                    pic.pic = path;
                });
                this.addForm.pics.splice(index, 1);
            },
            handleSuccess(response) {
                //将数据存储到addForm中
                const imgInfo = {pic: response.data.tmp_path};
                this.addForm.pics.push(imgInfo);
                console.log(this.addForm);
            },
            //添加商品提交
            addGoods() {
                // console.log(this.addForm);
                this.$refs.addFormRef.validate(valid => {
                    if(valid){
                        let form = _.cloneDeep(this.addForm);
                        form.goods_cat = form.goods_cat.join(',');
                        //处理参数
                        //动态
                        this.manyTableData.forEach(item => {
                            const newInfo = {
                                attr_id: item.attr_id,
                                attr_value: item.attr_vals.join(' ')
                            }
                            this.addForm.attrs.push(newInfo);
                        });
                        //属性
                        this.onlyTableData.forEach(item => {
                            const newInfo = {
                                attr_id: item.attr_id,
                                attr_value: item.attr_vals
                            };
                            this.addForm.attrs.push(newInfo);
                        });
                        form.attrs = this.addForm.attrs;
                        // console.log(form);
                        // this.$router.push('/goods');
                        this.$http.post('goods',form).then((res) => {
                            let data = res.data;
                            if(data.meta.status!== 201){
                                return this.$message.error(data.meta.msg);
                            }
                            this.$message.success(data.meta.msg);
                            this.$router.push('/goods');
                        })
                    }
                })
            }
        },
        computed: {
            cateId() {
                let len = this.addForm.goods_cat.length;
                if(len !== 3){
                    return null;
                }
                return this.addForm.goods_cat[len-1];
            }
        }
    }
</script>

<style scoped>
    .el-steps{
        margin: 10px 0;
    }
    .el-step__title{
        font-size: 12px;
    }
    .el-checkbox {
        margin: 0 10px 0 0 !important;;
    }
    .img_preview{
        width: 100%;
    }
    .btnAdd{
        margin-top: 10px;
    }
</style>