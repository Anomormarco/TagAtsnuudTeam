/**
 * Auth API Swagger/OpenAPI Documentation
 * Day 4 - API Documentation
 */

const authSwaggerDocs = {
  '/api/v1/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register new user',
      description: 'Create a new user account with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password', 'confirmPassword'],
              properties: {
                name: {
                  type: 'string',
                  example: 'John Doe',
                  description: 'Full name of the user'
                },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john@example.com',
                  description: 'Email address (must be unique)'
                },
                password: {
                  type: 'string',
                  minLength: 6,
                  example: 'password123',
                  description: 'Password (minimum 6 characters)'
                },
                confirmPassword: {
                  type: 'string',
                  minLength: 6,
                  example: 'password123',
                  description: 'Confirm password (must match password)'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'User registered successfully' },
                  data: {
                    type: 'object',
                    properties: {
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string', enum: ['admin', 'owner', 'user'] }
                        }
                      },
                      accessToken: { type: 'string', description: 'JWT access token (1h expiry)' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string' }
                }
              }
            }
          }
          
          
        },
        '409': {
          description: 'Email already registered',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Email already registered' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticate user with email and password',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john@example.com'
                },
                password: {
                  type: 'string',
                  example: 'password123'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful'
        },
        '401': {
          description: 'Invalid email or password'
        }
      }
    }
  },

  '/api/v1/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get current user profile',
      description: 'Retrieve authenticated user information',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'User profile retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      phone: { type: 'string' },
                      role: { type: 'string', enum: ['admin', 'owner', 'user'] },
                      avatar: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        }
      }
    }
  },

  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Clear refresh token and end session',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Logout successful'
        },
        '401': {
          description: 'Unauthorized'
        }
      }
    }
  },

  '/api/v1/auth/refresh-token': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: {
                  type: 'string',
                  description: 'Refresh token (optional if using cookies)'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Token refreshed successfully'
        },
        '401': {
          description: 'Invalid or expired refresh token'
        }
      }
    }
  }
};

module.exports = authSwaggerDocs;
