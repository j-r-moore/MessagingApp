import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';

export const socket = io('https://jaydenmoore.net');
