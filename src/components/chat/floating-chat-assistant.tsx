import { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  Card,
  Button,
  Chip,
} from '@mui/material';
import {
  Send,
  AutoAwesome,
  SmartToy,
  Analytics,
  Description,
  Psychology,
  TrendingUp,
} from '@mui/icons-material';
import { Chat, Message } from 'src/types/chat';

// Recommended questions
const recommendedQuestions = [
  'What are the top trending topics this week?',
  'Show me sentiment analysis for negative posts',
  'What cities have the lowest sentiment scores?',
  'Analyze sentiment trends over the last month',
  'What are the main issues being discussed?',
  'Compare sentiment across different platforms',
  'Generate a summary report for this topic',
  'Show me the most engaging posts',
];

// Demo chat data - Using icons instead of image avatars
const chatData: Chat[] = [
  {
    id: 'c1',
    avatar: 'AI',
    name: 'AI Assistant',
    text: 'How can I help you today?',
    time: 2,
    textCount: 3,
    color: '#10B981',
  },
  {
    id: 'c2',
    avatar: 'DA',
    name: 'Data Analyst',
    text: 'Ready to analyze your data',
    time: 5,
    textCount: 0,
    color: '#DC3545',
  },
  {
    id: 'c3',
    avatar: 'RG',
    name: 'Report Generator',
    text: 'Generate insights automatically',
    time: 10,
    textCount: 2,
    color: '#F59E0B',
  },
  {
    id: 'c4',
    avatar: 'SA',
    name: 'Sentiment Analyzer',
    text: 'Analyze sentiment patterns',
    time: 15,
    textCount: 0,
    color: '#10B981',
  },
  {
    id: 'c5',
    avatar: 'TP',
    name: 'Trend Predictor',
    text: 'Predict future trends',
    time: 20,
    textCount: 1,
    color: '#F59E0B',
  },
];

const demoMessages: { [key: string]: Message[] } = {
  c1: [
    {
      id: 'm1',
      text: 'Hello! How can I help you with your sentiment analysis today?',
      sender: 'assistant',
      time: new Date(Date.now() - 120000),
    },
  ],
  c2: [
    {
      id: 'm2',
      text: 'I can help you analyze trends in your data. What would you like to explore?',
      sender: 'assistant',
      time: new Date(Date.now() - 300000),
    },
  ],
  c3: [
    {
      id: 'm3',
      text: 'I can generate comprehensive reports from your topic data. Just let me know which topic!',
      sender: 'assistant',
      time: new Date(Date.now() - 600000),
    },
  ],
};

export default function FloatingChatAssistant() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatData[0]?.id || null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(demoMessages);
  const [inputText, setInputText] = useState('');

  const selectedChat = chatData.find((c) => c.id === selectedChatId);
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSendMessage = (e?: React.FormEvent, questionText?: string) => {
    if (e) e.preventDefault();
    const textToSend = questionText || inputText;
    if (!textToSend.trim() || !selectedChatId) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      text: textToSend,
      sender: 'user',
      time: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
    }));

    setInputText('');

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `m${Date.now()}`,
        text: 'Thank you for your message. This is a demo response. In production, this would connect to your AI assistant.',
        sender: 'assistant',
        time: new Date(),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedChatId]: [...prev[selectedChatId], assistantMessage],
      }));
    }, 1000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar kiri */}
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          maxWidth: 400,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Card sx={{ borderRadius: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Topics
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List sx={{ py: 0 }}>
              {chatData.map((chat) => {
                const isActive = chat.id === selectedChatId;
                return (
                  <ListItemButton
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    selected={isActive}
                    sx={{
                      py: 2,
                      px: 2.5,
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                      },
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: chat.color,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: 'background.paper',
                          },
                        }}
                      >
                        <Avatar sx={{ bgcolor: chat.color }}>{chat.avatar}</Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {chat.name}
                          </Typography>
                          {chat.textCount > 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                              }}
                            >
                              <Typography variant="caption" fontWeight={600}>
                                {chat.textCount}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {chat.text}{' '}
                          <Typography component="span" variant="caption" color="text.disabled">
                            · {chat.time}m
                          </Typography>
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        </Card>
      </Box>

      {/* Area chat kanan */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header nama & avatar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {selectedChat ? (
            <>
              <Avatar sx={{ width: 40, height: 40, bgcolor: selectedChat.color }}>
                {selectedChat.avatar}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedChat.name}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary">
              Pilih topic di sidebar
            </Typography>
          )}
        </Box>

        {/* Konten chat (scrollable) */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {selectedChat ? (
            <ChatContent
              chat={selectedChat}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography>Tidak ada chat terpilih.</Typography>
            </Box>
          )}
        </Box>

        {/* Input box */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            p: 2,
          }}
        >
          <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!inputText.trim()}
              endIcon={<Send />}
              sx={{ px: 3, borderRadius: 2 }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

interface ChatContentProps {
  chat: Chat;
  messages: Message[];
  onSendMessage: (e?: React.FormEvent, questionText?: string) => void;
}

const ChatContent: React.FC<ChatContentProps> = ({ chat, messages, onSendMessage }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  const handleQuestionClick = (question: string) => {
    onSendMessage(undefined, question);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Show recommendations at the start */}
      {messages.length === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Welcome message */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Avatar alt={chat.name} sx={{ width: 32, height: 32, bgcolor: chat.color }}>
              {chat.avatar}
            </Avatar>
            <Paper
              elevation={0}
              sx={{
                maxWidth: '80%',
                px: 2,
                py: 1.5,
                bgcolor: 'grey.100',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">{chat.text}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  textAlign: 'right',
                  color: 'text.secondary',
                }}
              >
                {chat.time}m ago
              </Typography>
            </Paper>
          </Box>

          {/* Recommended questions section */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Avatar
              alt={chat.name}
              sx={{ width: 32, height: 32, visibility: 'hidden', bgcolor: chat.color }}
            >
              {chat.avatar}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesome sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Suggested Questions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recommendedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => handleQuestionClick(question)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          {message.sender === 'assistant' && (
            <Avatar alt={chat.name} sx={{ width: 32, height: 32, bgcolor: chat.color }}>
              {chat.avatar}
            </Avatar>
          )}
          <Paper
            elevation={0}
            sx={{
              maxWidth: '60%',
              px: 2,
              py: 1.5,
              bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
              color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">{message.text}</Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                textAlign: 'right',
                opacity: 0.7,
              }}
            >
              {formatTime(message.time)}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};
