class PongGame:
    def __init__(self, width=800, height=400):
        self.width = width
        self.height = height
        self.ball_radius = 5
        self.paddle_width = 10
        self.paddle_height = 80
        self.ball_speed = 5
        self.paddle_speed = 6
        
        # Ball properties
        self.ball_x = width / 2
        self.ball_y = height / 2
        self.ball_vx = self.ball_speed
        self.ball_vy = self.ball_speed
        
        # Paddles
        self.player_y = (height - self.paddle_height) / 2
        self.computer_y = (height - self.paddle_height) / 2
        self.player_x = 10
        self.computer_x = width - 20
        
        # Scores
        self.player_score = 0
        self.computer_score = 0
        
        # Game state
        self.game_running = False
    
    def start_game(self):
        """Start or restart the game"""
        self.game_running = True
        self.reset_ball()
    
    def reset_ball(self):
        """Reset ball to center"""
        self.ball_x = self.width / 2
        self.ball_y = self.height / 2
        self.ball_vx = self.ball_speed * (1 if self.player_score < self.computer_score else -1)
        self.ball_vy = self.ball_speed
    
    def update_ball(self):
        """Update ball position and handle collisions"""
        if not self.game_running:
            return
        
        # Update position
        self.ball_x += self.ball_vx
        self.ball_y += self.ball_vy
        
        # Top and bottom wall collision
        if self.ball_y - self.ball_radius <= 0 or self.ball_y + self.ball_radius >= self.height:
            self.ball_vy = -self.ball_vy
            self.ball_y = max(self.ball_radius, min(self.height - self.ball_radius, self.ball_y))
        
        # Left paddle collision
        if (self.ball_x - self.ball_radius <= self.player_x + self.paddle_width and
            self.player_y <= self.ball_y <= self.player_y + self.paddle_height):
            self.ball_vx = -self.ball_vx
            self.ball_x = self.player_x + self.paddle_width + self.ball_radius
        
        # Right paddle collision
        if (self.ball_x + self.ball_radius >= self.computer_x and
            self.computer_y <= self.ball_y <= self.computer_y + self.paddle_height):
            self.ball_vx = -self.ball_vx
            self.ball_x = self.computer_x - self.ball_radius
        
        # Score points
        if self.ball_x < 0:
            self.computer_score += 1
            self.reset_ball()
        elif self.ball_x > self.width:
            self.player_score += 1
            self.reset_ball()
    
    def update_player_paddle(self, mouse_y=None, key_up=False, key_down=False):
        """Update player paddle position"""
        if mouse_y is not None:
            self.player_y = mouse_y - self.paddle_height / 2
        elif key_up:
            self.player_y -= self.paddle_speed
        elif key_down:
            self.player_y += self.paddle_speed
        
        # Boundary check
        self.player_y = max(0, min(self.height - self.paddle_height, self.player_y))
    
    def update_computer_paddle(self):
        """Update computer paddle with AI"""
        paddle_center = self.computer_y + self.paddle_height / 2
        
        # Simple AI: follow the ball
        if paddle_center < self.ball_y - 35:
            self.computer_y += self.paddle_speed * 0.8
        elif paddle_center > self.ball_y + 35:
            self.computer_y -= self.paddle_speed * 0.8
        
        # Boundary check
        self.computer_y = max(0, min(self.height - self.paddle_height, self.computer_y))
    
    def update(self, mouse_y=None, key_up=False, key_down=False):
        """Update game state"""
        self.update_ball()
        self.update_player_paddle(mouse_y, key_up, key_down)
        self.update_computer_paddle()
    
    def get_state(self):
        """Get current game state"""
        return {
            'ball': {
                'x': self.ball_x,
                'y': self.ball_y,
                'radius': self.ball_radius
            },
            'player_paddle': {
                'x': self.player_x,
                'y': self.player_y,
                'width': self.paddle_width,
                'height': self.paddle_height
            },
            'computer_paddle': {
                'x': self.computer_x,
                'y': self.computer_y,
                'width': self.paddle_width,
                'height': self.paddle_height
            },
            'scores': {
                'player': self.player_score,
                'computer': self.computer_score
            },
            'game_running': self.game_running
        }
    
    def reset_scores(self):
        """Reset scores"""
        self.player_score = 0
        self.computer_score = 0
        self.reset_ball()


if __name__ == "__main__":
    game = PongGame()
    print("Pong Game Engine Loaded")
    print(f"Canvas: {game.width}x{game.height}")
    print("Use this with a web interface or Pygame for rendering")
