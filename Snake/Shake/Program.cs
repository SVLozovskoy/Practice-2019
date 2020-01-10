using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Shake
{
    class Program
    {
        static void Main(string[] args)
        {
           
                Console.SetWindowSize(1, 1);
                Console.SetBufferSize(80, 25);
                Console.SetWindowSize(80, 25);
          

                Walls walls = new Walls(80, 25);
                walls.Draw();

                Point p1 = new Point(10, 10, '*');

                Snake snake = new Snake(p1, 4, Direction.RIGHT);
                snake.Draw();
                snake.Move();

                FoodCreator foodCreator = new FoodCreator(80, 25, '#');
                Point food = foodCreator.CreateFood();
                food.Draw();

                while (true)
                {
                    if (walls.IsHit(snake) || snake.IsHitTail())
                    {
                        break;
                    }

                    if (snake.Eat(food))
                    {
                        food = foodCreator.CreateFood();
                        food.Draw();
                    }

                    else
                    {
                        snake.Move();
                    }

                    Thread.Sleep(100);

                    if (Console.KeyAvailable)
                    {
                        ConsoleKeyInfo key = Console.ReadKey();
                        snake.HandleKey(key.Key);
                    }

                    snake.Move();
                }


                Console.Clear();
                Console.SetCursorPosition(35, 10);
                Console.WriteLine("Game Over!");
                Console.SetCursorPosition(33, 12);
                Console.WriteLine("Длина змейки: {0}", snake.Score());
                Console.ReadLine();
          
        } 
    }
}
