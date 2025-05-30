import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';  // 删除 Button 导入
import { StorageService } from '../services/storage';
import { MasturbationRecord, MasturbationStats } from '../types/record';
// 删除 GitHubIcon 导入

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 52; // 将显示时间范围改为4周
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
// 删除 GITHUB_REPO_URL 常量

/**
 * 统计图表组件
 * 展示发射记录的统计数据和可视化图表，包含以下功能：
 * 1. 显示基础统计数据（总次数、平均时长、周频率、月频率）
 * 2. 展示类似GitHub贡献图的发射日历
 * 3. 自动更新数据（定时更新和事件监听）
 */
export const StatsChart = () => {
    // 统计数据状态
    const [stats, setStats] = useState<MasturbationStats>({
        totalCount: 0,
        averageDuration: 0,
        maxDuration: 0,
        frequencyPerWeek: 0,
        frequencyPerMonth: 0,
        frequencyPerYear: 0,
    });
    // 记录数据状态
    const [records, setRecords] = useState<MasturbationRecord[]>([]);

    /**
     * 更新统计数据和记录
     * 从StorageService获取最新数据并更新状态
     */
    const updateData = () => {
        const newStats = StorageService.getStats();
        const newRecords = StorageService.getRecords();
        setStats(newStats);
        setRecords(newRecords);
    };

    // 组件挂载时设置自动更新
    useEffect(() => {
        updateData();
        const interval = setInterval(updateData, 60000);

        // 监听记录更新事件
        const handleRecordUpdate = () => {
            updateData();
        };
        window.addEventListener('masturbation_record_updated', handleRecordUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('masturbation_record_updated', handleRecordUpdate);
        };
    }, []);

    // 监听localStorage变化
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'masturbation_records') {
                updateData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    /**
     * 获取贡献度等级（0-4）
     * @param count 当天的记录次数
     * @returns 贡献度等级
     */
    const getContributionLevel = (count: number): number => {
        if (count >= 180) return 5;
        if (count >= 120) return 4;
        if (count >= 60) return 3;
        if (count >= 30) return 2;
        if (count > 0) return 1;
        return 0;
    };

    /**
     * 生成贡献图数据
     * @returns 二维数组，表示每周每天的记录次数
     */
    const generateContributionData = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        // 获取当前日期所在周的结束日期
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (DAYS_IN_WEEK - now.getDay()));

        const startDate = new Date(now);
        startDate.setDate(endOfWeek.getDate() - (DAYS_IN_WEEK * WEEKS_TO_SHOW - 1));

        // 初始化贡献数据数组
        const contributionData = Array(WEEKS_TO_SHOW).fill(0).map(() =>
            Array(DAYS_IN_WEEK).fill(0)
        );

        // 统计每天的记录次数
        records.forEach(record => {
            const recordDate = new Date(record.startTime);
            recordDate.setHours(0, 0, 0, 0);
            
            // 确保记录日期在显示范围内
            if (recordDate >= startDate && recordDate <= endOfWeek) {
                // 计算记录日期距离结束日期（今天）的天数
                const daysDiff = Math.floor((endOfWeek.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // 计算在哪一周和哪一天
                const weekIndex = Math.floor(daysDiff / DAYS_IN_WEEK);
                const dayIndex = daysDiff % DAYS_IN_WEEK;
                
                if (weekIndex >= 0 && weekIndex < WEEKS_TO_SHOW && dayIndex >= 0 && dayIndex < DAYS_IN_WEEK) {
                    // contributionData[WEEKS_TO_SHOW - 1 - weekIndex][DAYS_IN_WEEK - 1 - dayIndex]++;
                    contributionData[WEEKS_TO_SHOW - 1 - weekIndex][DAYS_IN_WEEK - 1 - dayIndex]=contributionData[WEEKS_TO_SHOW - 1 - weekIndex][DAYS_IN_WEEK - 1 - dayIndex]+record.duration;
                }
            }
        });

        return contributionData;
    };

    /**
     * 获取月份标签
     * @returns 月份标签数组，包含标签文本和对应的周索引
     */
    const getMonthLabels = () => {
        const now = new Date();
        // 获取当前日期所在周的结束日期
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (DAYS_IN_WEEK - now.getDay()));

        const startDate = new Date(now);
        startDate.setDate(endOfWeek.getDate() - (DAYS_IN_WEEK * WEEKS_TO_SHOW));
        // const months: { label: string; index: number }[] = [];
        const months: { [key: number]: string } = {};
        
        // 生成月份标签
        for (let week = 0; week < WEEKS_TO_SHOW; week++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (week * 7));
            const monthName = date.getMonth() + 1;
            if (week === 0 || date.getDate() <= 7) {
                // months.push({ label: `${monthName}月`, index: week });
                months[week] = `${monthName}月`
            };
        }
        return months;
    };

    // 生成贡献图数据和月份标签
    const contributionData = generateContributionData();
    const monthLabels = getMonthLabels();

    return (
        <Box sx={{ 
            mt: 4,
            width: '100%',
            maxWidth: '600px',
            mx: 'auto'
        }}>
            <Typography 
                variant="h5" 
                sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 4
                }}
            >
                统计数据
            </Typography>

            {/* 删除整个 GitHub Star 按钮的 Box 组件 */}

            <Grid container spacing={2} sx={{ mb: 3 }} columns={12}>
                <Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            平均持续时间
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.averageDuration.toFixed(1)}
                            <Typography 
                                component="span" 
                                variant="h5" 
                                sx={{ 
                                    ml: 1,
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                分钟
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid><Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            最长持续时间
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.maxDuration.toFixed(1)}
                            <Typography 
                                component="span" 
                                variant="h5" 
                                sx={{ 
                                    ml: 1,
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                分钟
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 2,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            总次数
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.totalCount}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            本周次数
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.frequencyPerWeek}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            本月次数
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.frequencyPerMonth}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper 
                        sx={{ 
                            p: 3,
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: 3,
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ mb: 1, fontWeight: 500 }}
                        >
                            本年次数
                        </Typography>
                        <Typography 
                            variant="h3"
                            sx={{ 
                                fontWeight: 700,
                                color: 'primary.main'
                            }}
                        >
                            {stats.frequencyPerYear}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Paper elevation={2} sx={{
                p: 3,
                borderRadius: 3,
                width: '100%',
                maxWidth: '100%',
                minHeight: '300px',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
            }}>
                <Typography 
                    variant="h6" 
                    sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: 'text.primary'
                    }}
                >
                    发射日历
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'fit-content',
                    minWidth: 'auto',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: 2,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    pb: 2
                }}>
                    {/* 月份标签 */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        pt: 4
                    }}>
                        {/* {monthLabels.map((month, index) => (
                            <Typography
                                key={index}
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '10px',
                                    height: '12px',
                                    lineHeight: '10px',
                                    mb: month.index === 0 ? 0 : '2px'
                                }}
                            >
                                {month.label}
                            </Typography>
                        ))} */}
                        {(() => {
                            const elements = []
                            for (let week = 0; week < WEEKS_TO_SHOW; week++) {
                                elements.push(
                                    <Typography
                                        key={week}
                                        variant="caption"
                                        // 垂直居中
                                        alignItems={'vertical'}
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '10px',
                                            height: '16px',
                                            lineHeight: '0px',
                                            mb: week === 0 ? 0 : '2px'
                                        }}
                                    >
                                        {monthLabels[week] ? monthLabels[week] : ''}
                                    </Typography>
                                );
                            }
                            return elements;
                        })()}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* 星期标签 */}
                        <Box sx={{
                            display: 'flex',
                            mb: 1,
                            gap: '2px'
                        }}>
                            {WEEKDAYS.map((day, index) => (
                                <Typography
                                    key={index}
                                    variant="caption"
                                    sx={{
                                        width: '18px',
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                        fontSize: '10px'
                                    }}
                                >
                                    {day}
                                </Typography>
                            ))}
                        </Box>

                        {/* 贡献图 */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateRows: `repeat(${WEEKS_TO_SHOW}, 1fr)`,
                            gap: '4px',
                            flex: 1
                        }}>
                            {contributionData.map((week, weekIndex) => (
                                <Box key={weekIndex} sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '4px'
                                }}>
                                    {week.map((count, dayIndex) => {
                                        const date = new Date();
                                        // 计算当前日期所在周的结束日期
                                        date.setDate(date.getDate() + (DAYS_IN_WEEK - date.getDay()));
                                        const daysToSubtract = (weekIndex * 7) + dayIndex;
                                        date.setDate(date.getDate() - (DAYS_IN_WEEK * WEEKS_TO_SHOW - 1) + daysToSubtract);
                                        return (
                                            <Box
                                                key={`${weekIndex}-${dayIndex}`}
                                                sx={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: count === 0 ? 'rgba(235, 237, 240, 0.5)' : `rgba(40, 167, 69, ${getContributionLevel(count) * 0.25})`,
                                                    border: '1px solid rgba(27, 31, 35, 0.06)',
                                                    borderRadius: '2px',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                                                    }
                                                }}
                                                title={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日: ${Math.floor(count)}分${Math.round((count - Math.floor(count)) * 60)}秒`}
                                            />
                                        );
                                    })}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};