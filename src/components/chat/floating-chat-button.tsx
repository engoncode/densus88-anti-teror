import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  IconButton,
  TextField,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Chat, Close, Send, SmartToy, Delete } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import api from 'src/services/api';
import { useTypewriter } from './use-typewriter';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

interface FloatingChatButtonProps {
  topicId: number;
  topicName: string;
}

const suggestionCache = new Map<string, { expiresAt: number; suggestions: string[] }>();

export default function FloatingChatButton({ topicId, topicName }: FloatingChatButtonProps) {
  const storageKey = `chatHistory-${topicId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem(storageKey);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error('Failed to load messages from localStorage', error);
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestionsRetry, setSuggestionsRetry] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseId = useRef<number | null>(null);
  const requestController = useRef<AbortController | null>(null);
  const typewriter = useTypewriter((text) => {
    setMessages((prev) => prev.map((message) =>
      message.id === responseId.current ? { ...message, text } : message
    ));
  });
  useEffect(() => () => requestController.current?.abort(), []);
  const token = localStorage.getItem('access_token');

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  // Save messages to localStorage
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage', error);
    }
  }, [messages, storageKey, isLoading]);

  // Initial message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: `Halo! Ada yang bisa saya bantu terkait topik "${topicName}"?`,
          sender: 'ai',
        },
      ]);
    }

  }, [isOpen, topicName, messages.length]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const cacheKey = `${localStorage.getItem('auth_token') || token || ''}:${topicId}`;
    const cached = suggestionCache.get(cacheKey);
    setSuggestionsError(null);
    if (cached && cached.expiresAt > Date.now()) {
      setSuggestions(cached.suggestions);
      setIsLoadingSuggestions(false);
      return undefined;
    }
    suggestionCache.delete(cacheKey);
    const controller = new AbortController();
    setSuggestions([]);
    setIsLoadingSuggestions(true);

    const loadSuggestions = async () => {
      try {
        const { data } = await api.post<{ suggestions: string[] }>(
          '/assistant/suggestions',
          { topic_id: topicId },
          { signal: controller.signal, timeout: 40000 }
        );
        if (!Array.isArray(data.suggestions)
          || !data.suggestions.every((item) => typeof item === 'string' && item.trim() !== '')) {
          throw new Error('Format saran AI tidak valid.');
        }
        if (controller.signal.aborted) return;
        for (const [key, entry] of suggestionCache) {
          if (entry.expiresAt <= Date.now()) suggestionCache.delete(key);
        }
        suggestionCache.set(cacheKey, { suggestions: data.suggestions, expiresAt: Date.now() + 600000 });
        setSuggestions(data.suggestions);
      } catch (error) {
        if (axios.isCancel(error) || controller.signal.aborted) return;
        console.error('Failed to load assistant suggestions', error);
        setSuggestionsError('Saran AI gagal dimuat. Silakan coba lagi.');
      } finally {
        if (!controller.signal.aborted) setIsLoadingSuggestions(false);
      }
    };
    void loadSuggestions();
    return () => controller.abort();
  }, [isOpen, topicId, token, suggestionsRetry]);

  const handleClearHistory = () => {
    requestController.current?.abort();
    requestController.current = null;
    typewriter.cancel();
    responseId.current = null;
    setIsLoading(false);
    localStorage.removeItem(storageKey);
    setMessages([
      {
        id: 1,
        text: `Halo! Ada yang bisa saya bantu terkait topik "${topicName}"?`,
        sender: 'ai',
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    const aiId = userMessage.id + 1;
    responseId.current = aiId;
    const controller = new AbortController();
    requestController.current = controller;
    typewriter.start();

    // Add user message and prepare for AI response
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: aiId, text: '', sender: 'ai' },
    ]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post<ReadableStream<Uint8Array>>('/assistant/query/stream',
        {
          query: inputValue,
          topic_id: topicId,
          top_k: 10,
        },
        { adapter: 'fetch', responseType: 'stream', signal: controller.signal }
      );
      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let streamDone = false;
      const consumeLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'delta' && typeof event.data === 'string') typewriter.append(event.data);
        else if (event.type === 'error') throw new Error(String(event.data));
        else if (event.type === 'done') streamDone = true;
      };
      try {
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            consumeLine(buffer);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            consumeLine(line);
            if (streamDone) break;
          }
        }
      } finally {
        await reader.cancel();
      }
      if (controller.signal.aborted || requestController.current !== controller) return;
      await typewriter.finish();
    } catch (error) {
      if (requestController.current !== controller) return;
      typewriter.cancel();
      if (controller.signal.aborted) return;
      console.error('Streaming failed:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            text: 'Maaf, terjadi kesalahan saat menghubungi AI assistant.',
          };
        }
        return newMessages;
      });
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Auto submit after setting value
    setTimeout(() => {
      const form = document.getElementById('chat-form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="AI Assistant"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: isOpen ? 'none' : 'flex',
        }}
      >
        <Chat />
      </Fab>

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100% - 32px)', sm: 400 },
            height: { xs: 'calc(100% - 32px)', sm: 600 },
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
            </Box>
            <Box>
              <IconButton
                aria-label="Hapus riwayat AI Assistant"
                size="small"
                onClick={handleClearHistory}
                sx={{ color: 'primary.contrastText', mr: 1 }}
              >
                <Delete fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Tutup AI Assistant"
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'primary.contrastText' }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  elevation={0}
                  data-chat-message={msg.id}
                  data-sender={msg.sender}
                  sx={{
                    maxWidth: '80%',
                    px: 2,
                    py: 1.5,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'grey.900',
                    borderRadius: 2,
                  }}
                >
                  {isLoading &&
                  msg.id === messages[messages.length - 1].id &&
                  msg.sender === 'ai' &&
                  msg.text === '' ? (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 20,
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'grey.600',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '-0.32s',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': {
                              transform: 'scale(0)',
                            },
                            '40%': {
                              transform: 'scale(1)',
                            },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'grey.600',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '-0.16s',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': {
                              transform: 'scale(0)',
                            },
                            '40%': {
                              transform: 'scale(1)',
                            },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'grey.600',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          '@keyframes bounce': {
                            '0%, 80%, 100%': {
                              transform: 'scale(0)',
                            },
                            '40%': {
                              transform: 'scale(1)',
                            },
                          },
                        }}
                      />
                    </Box>
                  ) : msg.sender === 'ai' ? (
                    <Box
                      sx={{
                        '& p': { my: 0.5, lineHeight: 1.6 },
                        '& p:first-of-type': { mt: 0 },
                        '& p:last-of-type': { mb: 0 },
                        '& ul, & ol': { my: 0.5, pl: 2 },
                        '& li': { my: 0.25 },
                        '& code': {
                          bgcolor: 'grey.200',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontSize: '0.85em',
                          fontFamily: 'monospace',
                        },
                        '& pre': {
                          bgcolor: 'grey.200',
                          p: 1,
                          borderRadius: 1,
                          overflow: 'auto',
                        },
                        '& strong': { fontWeight: 600 },
                        '& em': { fontStyle: 'italic' },
                        fontSize: '0.875rem',
                        color: 'grey.900',
                      }}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <Typography component="p" variant="body2" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong style={{ fontWeight: 600 }} {...props} />
                          ),
                          em: ({ node, ...props }) => <em {...props} />,
                          ul: ({ node, ...props }) => (
                            <ul style={{ listStyleType: 'disc', marginLeft: '1rem' }} {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              style={{ listStyleType: 'decimal', marginLeft: '1rem' }}
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <Typography component="li" variant="body2" {...props} />
                          ),
                          code: ({ node, ...props }) => <code {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      {isLoading && msg.id === responseId.current && (
                        <span
                          aria-hidden="true"
                          className="inline-block h-[14px] w-[2px] animate-pulse bg-current motion-reduce:animate-none"
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2">{msg.text}</Typography>
                  )}
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Suggestions */}
          {(messages.length <= 2 || suggestionsError) && !isLoading && (
            <Box
              sx={{
                px: 2,
                pb: 2,
                borderTop: 1,
                borderColor: 'divider',
                pt: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {isLoadingSuggestions ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: '100%', textAlign: 'center', fontStyle: 'italic' }}
                  >
                    Memuat saran...
                  </Typography>
                ) : suggestionsError ? (
                  <div role="alert" className="text-xs text-danger">
                    {suggestionsError}
                    <button
                      type="button"
                      onClick={() => setSuggestionsRetry((value) => value + 1)}
                      className="ml-[8px] cursor-pointer rounded border border-line bg-surface px-[8px] py-[4px] text-fg"
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : (
                  suggestions.map((q, i) => (
                    <Chip
                      key={i}
                      label={q}
                      onClick={() => handleSuggestionClick(q)}
                      size="small"
                      sx={{
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        },
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>
          )}

          {/* Input Form */}
          <Box
            component="form"
            id="chat-form"
            onSubmit={handleSubmit}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ketik pesan Anda..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={isLoading || !inputValue.trim()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                  },
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
}
