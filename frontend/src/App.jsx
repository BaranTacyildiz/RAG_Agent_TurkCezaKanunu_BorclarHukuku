import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, List, Typography, Spin, Card, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Merhaba! Ben Hukuk Asistanıyım. Size Türk Ceza Kanunu ve Borçlar Hukuku konusunda nasıl yardımcı olabilirim?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Yeni mesaj geldiğinde otomatik en alta kaydır
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userQuery = inputValue;
    // Kullanıcı mesajını ekrana ekle
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setInputValue('');
    setLoading(true);

    try {
      // FastAPI Backend'e istek at
      const response = await axios.post('http://localhost:8000/api/chat', {
        query: userQuery
      });

      // Gelen cevabı ekrana ekle
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error("Hata oluştu:", error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Üzgünüm, bir hata oluştu. Sunucu bağlantısını kontrol edin.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Layout style={{ height: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ background: '#001529', display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>⚖️ TCK & TBH Hukuk Asistanı</Title>
      </Header>
      
      <Content style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <Card 
          style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}
          bodyStyle={{ flex: 1, overflowY: 'auto', padding: '10px' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(msg, index) => (
              <List.Item style={{ borderBottom: 'none', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '10px'
                }}>
                  <Avatar 
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                    style={{ backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a' }}
                  />
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f6ffed',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${msg.role === 'user' ? '#91d5ff' : '#b7eb8f'}`,
                    whiteSpace: 'pre-wrap' // Markdown/alt satır formatını korumak için
                  }}>
                    <Text>{msg.content}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Spin /> <Text type="secondary">Asistan kanunları inceliyor...</Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>
      </Content>

      <Footer style={{ padding: '20px', background: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '10px' }}>
          <Input 
            size="large"
            placeholder="Hukuki sorunuzu buraya yazın (Örn: Arkadaşımı bıçakladım kaç yıl yargılanırım?)" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button 
            type="primary" 
            size="large" 
            icon={<SendOutlined />} 
            onClick={handleSend}
            loading={loading}
          >
            Gönder
          </Button>
        </div>
      </Footer>
    </Layout>
  );
}

export default App;