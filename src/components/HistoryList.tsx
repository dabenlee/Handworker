import { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { StorageService } from '../services/storage';
import { MasturbationRecord } from '../types/record';
import DeleteIcon from '@mui/icons-material/Delete';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import EditIcon from '@mui/icons-material/Edit';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import CommentIcon from '@mui/icons-material/Comment';

/**
 * 历史记录列表组件
 * 展示所有发射记录的历史列表，包含以下功能：
 * 1. 显示记录的详细信息（时间、持续时间、备注）
 * 2. 删除单条记录
 * 3. 清空所有记录（带确认对话框）
 * 4. 自动更新数据（定时更新和事件监听）
 */
export const HistoryList = () => {
    // 所有记录数据
    const [records, setRecords] = useState<MasturbationRecord[]>([]);
    // 清空确认对话框的显示状态
    const [openDialog, setOpenDialog] = useState(false);
    const [editRecord, setEditRecord] = useState<MasturbationRecord | null>(null);

    /**
     * 更新记录数据
     * 从StorageService获取最新数据并更新状态
     */
    const updateData = () => {
        const newRecords = StorageService.getRecords();
        setRecords(newRecords);
    };

    // 组件挂载时设置自动更新
    useEffect(() => {
        // 初始加载数据
        updateData();
        // 每分钟自动更新一次
        const interval = setInterval(updateData, 60000);

        // 监听记录更新事件
        const handleRecordUpdate = () => {
            updateData();
        };
        window.addEventListener('masturbation_record_updated', handleRecordUpdate);

        // 清理定时器和事件监听
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
     * 删除单条记录
     * @param id 要删除的记录ID
     */
    const handleDeleteRecord = (id: string) => {
        StorageService.deleteRecord(id);
        setRecords(records.filter(record => record.id !== id));
    };

    const getInputValue = (date: Date) => {
        // 转换为本地时间对象（自动应用浏览器时区）
        const localDate = date;
        
        // 计算时区偏移量（分钟转小时）
        const timezoneOffsetHours = localDate.getTimezoneOffset() / 60;
        
        // 生成UTC时间（手动修正时区）
        const adjustedDate = new Date(localDate);
        adjustedDate.setHours(adjustedDate.getHours() - timezoneOffsetHours);
        return adjustedDate.toISOString().slice(0, 19);
    };

    /**
     * 清空所有记录
     */
    const handleClearAllRecords = () => {
        records.forEach(record => StorageService.deleteRecord(record.id));
        setRecords([]);
        setOpenDialog(false);
    };

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography 
                    variant="h5" 
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    历史记录
                </Typography>
                <IconButton
                    color="error"
                    onClick={() => setOpenDialog(true)}
                    title="清空所有数据"
                    sx={{
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.2)',
                            transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <CleaningServicesIcon />
                </IconButton>
            </Box>

            <Box sx={{ 
                overflowX: 'auto',
                width: '100%',
                maxWidth: '800px',
                mb: 4,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 3,
                borderRadius: 4,
                // background: '#f8f9fa 100%',
            }}>
                {records.slice().reverse().map(record => {
                    const minutes = Math.floor(record.duration);
                    const seconds = Math.round((record.duration - minutes) * 60);
                    return (
                        <Paper
                            key={record.id}
                            elevation={1}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2.5,
                                mx: 'auto',
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                transition: 'all 0.3s ease',
                                width: '100%',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                }
                            }}
                        >
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            mb: 1, 
                                            color: 'primary.main',
                                            fontWeight: 600 
                                        }}
                                    >
                                        {new Date(record.startTime).toLocaleString()}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 2
                                        }}
                                    >
                                        <Box component="span" sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            borderRadius: 1,
                                            px: 1.5,
                                            py: 0.5
                                        }}>
                                            <TimelapseIcon fontSize='small'/>&nbsp;{minutes}分{seconds}秒
                                        </Box>
                                        {record.notes && (
                                            <Typography 
                                                component="span" 
                                                sx={{ 
                                                    color: 'text.secondary',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                    borderRadius: 1,
                                                    px: 1.5,
                                                    py: 0.5
                                                }}
                                            >
                                                <CommentIcon fontSize='small'/>&nbsp;{record.notes}
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => handleDeleteRecord(record.id)}
                                    color="error"
                                    size="medium"
                                    sx={{
                                        ml: 2,
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => setEditRecord(record)}
                                    color="primary"
                                    size="medium"
                                    sx={{
                                        ml: 2,
                                        backgroundColor: 'rgba(54, 92, 244, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(54, 92, 244, 0.2)',
                                            transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Paper>
                        );
                    })}

                    <Dialog
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                    >
                        <DialogTitle>确认清空数据</DialogTitle>
                        <DialogContent>
                            <Typography>确定要删除所有记录吗？此操作不可恢复。</Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDialog(false)}>取消</Button>
                            <Button onClick={handleClearAllRecords} color="error">
                                确认清空
                            </Button>
                        </DialogActions>
                    </Dialog>


                    <Dialog
                        open={!!editRecord}
                        onClose={() => setEditRecord(null)}
                    >
                        <DialogTitle>编辑记录</DialogTitle>
                        <DialogContent>
                            {/* 这里需要根据 MasturbationRecord 类型添加输入框 */}
                            {/* 例如，如果有 startTime, duration, notes 字段 */}
                            {editRecord && ( 
                                <>
                                    <Typography>
                                        时间:
                                        <input
                                            type="datetime-local"
                                            value={getInputValue(editRecord.startTime)}
                                            step="1"
                                            onChange={(e) => setEditRecord({...editRecord, startTime: new Date(e.target.value) })}
                                        />
                                    </Typography>
                                    {/* const minutes = Math.floor(record.duration);
                                    const seconds = Math.round((record.duration - minutes) * 60); */}
                                    <Typography>
                                        持续时间:
                                        <input
                                            type="number"
                                            value={Math.floor(editRecord.duration)}
                                            onChange={(e) => setEditRecord({...editRecord, duration: parseFloat(e.target.value || "0") + (editRecord.duration - Math.floor(editRecord.duration)) })}
                                        />
                                        分
                                        <input
                                            type="number"
                                            max={59}
                                            value={Math.round((editRecord.duration - Math.floor(editRecord.duration)) * 60)}
                                            onChange={(e) => setEditRecord({...editRecord, duration: parseFloat(e.target.value || "0") / 60 + Math.floor(editRecord.duration) })}
                                        />
                                        秒
                                    </Typography>
                                    <Typography>
                                        备注:
                                        <input
                                            type="text"
                                            value={editRecord.notes || ''}
                                            onChange={(e) => setEditRecord({...editRecord, notes: e.target.value })}
                                        />
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditRecord(null)}>取消</Button>
                            <Button onClick={() => {
                                if (editRecord) {
                                    StorageService.updateRecord(editRecord);
                                    setEditRecord(null);
                                    updateData();
                                }
                            }}>确定</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
        </Box>
    );
};
