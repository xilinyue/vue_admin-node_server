<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--card视图-->
        <el-card>
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
    import echarts from 'echarts';
    import _ from 'lodash';
    export default {
        name: "Report",
        data() {
            return{
                option: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
            }
        },
        created() {

        },
        async mounted() {
            // this.getData();
            let myChart = echarts.init(document.getElementById('main'));

            const {data: res} = await this.$http.get('reports/type/1');
            // this.option = res.data;

            const result = _.merge(this.option, res.data);

            myChart.setOption(result);
        },
        methods: {
        }
    }
</script>

<style scoped>

</style>