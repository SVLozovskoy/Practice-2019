using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shake
{
    class FoodCreator
    {
        int mapWeidht;
        int mapHeigth;
        char sym;

        Random random = new Random();

        public FoodCreator(int mapWeidht, int mapHeigth, char sym)
        {
            this.mapHeigth = mapHeigth;
            this.mapWeidht = mapWeidht;
            this.sym = sym;
        }
        
        public Point CreateFood()
        {
            int x = random.Next(2, mapWeidht - 2);
            int y = random.Next(2, mapHeigth - 2);
            return new Point(x, y, sym);
        }
    }
}
