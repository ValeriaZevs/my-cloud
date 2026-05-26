import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutSuccess } from '../store/authSlice';
import { logoutUser, getFiles, uploadFile, deleteFile, updateFile, getShareLink } from '../api/files';

const DashboardPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  const [editingFileId, setEditingFileId] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  const username = useSelector((state) => state.auth.username);
  const isAdmin = useSelector((state) => state.auth.isAdmin); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error('Ошибка загрузки списка файлов:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logoutSuccess());
    navigate('/');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Пожалуйста, выберите файл');
      return;
    }
    setUploadError('');
    try {
      await uploadFile(selectedFile, comment);
      setSelectedFile(null);
      setComment('');
      document.getElementById('file-input').value = '';
      await fetchFiles();
    } catch (error) {
      setUploadError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Точно удалить этот файл?')) {
      try {
        await deleteFile(id);
        await fetchFiles();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleRenameSubmit = async (id) => {
    try {
      await updateFile(id, { original_name: newFileName });
      setEditingFileId(null); 
      await fetchFiles();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleShare = async (id) => {
    try {
      const data = await getShareLink(id);
      const shareUrl = data.url || `http://194.67.92.55:8000/api/files/share/${data.share_hash}/`;
      
      await navigator.clipboard.writeText(shareUrl);
      alert('Специальная ссылка скопирована в буфер обмена!\n' + shareUrl);
    } catch (error) {
      alert('Ошибка при генерации ссылки');
    }
  };

  const handleDownload = async (id, name) => {
    // Безопасное скачивание с передачей куки
    try {
      const response = await fetch(`http://194.67.92.55:8000/api/files/${id}/download/`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Ошибка скачивания');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>Моё облако ☁️</h2>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold' }}>Привет, {username || 'Пользователь'}!</span>
          
          {isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
              Админка
            </button>
          )}

          <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Выйти
          </button>
        </div>
      </header>

      <main>
        {/* Форма загрузки */}
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Загрузить новый файл</h3>
          {uploadError && <div style={{ color: 'red', marginBottom: '10px' }}>{uploadError}</div>}
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input id="file-input" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ flex: '1 1 200px' }} />
            <input type="text" placeholder="Комментарий (необязательно)" value={comment} onChange={(e) => setComment(e.target.value)} style={{ padding: '8px', flex: '2 1 250px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Загрузить</button>
          </form>
        </div>

        {/* Список файлов */}
        <h3>Ваши файлы:</h3>
        {files.length === 0 ? (
          <p style={{ color: '#777' }}>Хранилище пусто. Загрузите свой первый файл!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file) => (
              <li key={file.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  
                  {/* Логика переименования */}
                  {editingFileId === file.id ? (
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                      <input 
                        value={newFileName} 
                        onChange={(e) => setNewFileName(e.target.value)} 
                        style={{ padding: '4px' }}
                      />
                      <button onClick={() => handleRenameSubmit(file.id)} style={{ padding: '4px 8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Сохранить</button>
                      <button onClick={() => setEditingFileId(null)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Отмена</button>
                    </div>
                  ) : (
                    <strong style={{ fontSize: '16px', color: '#333' }}>{file.original_name}</strong>
                  )}
                  
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                    <strong>Размер:</strong> {(file.size / 1024).toFixed(1)} KB | <strong>Комментарий:</strong> {file.comment || 'Нет комментариев'}
                  </div>
                </div>

                {/* Блок с кнопками действий */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleDownload(file.id, file.original_name)} style={{ padding: '6px 12px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Скачать</button>
                  <button onClick={() => handleShare(file.id)} style={{ padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Поделиться</button>
                  <button onClick={() => { setEditingFileId(file.id); setNewFileName(file.original_name); }} style={{ padding: '6px 12px', background: '#888', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Переименовать</button>
                  <button onClick={() => handleDelete(file.id)} style={{ padding: '6px 12px', background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;