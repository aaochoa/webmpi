#include<iostream>
#include<time.h>
using namespace std;

int main()
{
  clock_t begin, end;
	double time_spent;

begin = clock();
/* here, do your time-consuming job */

  int n=0,c=0,c2=0,res=0,nc=0;
  cout<<"Introduce el limite de numeros: "; 
  n=25000;
  begin = clock();
  for(c=1;c<=n;c++)
  {
    for(c2=1;c2<=c;c2++)
    {
      res=c%c2;
      if(res==0)
      {
        nc=nc+1;
      }
    }
    if(nc==2)
    {
      cout<<" "<<c;
    }
    nc=0;
  }
	end = clock();
	time_spent = (double)(end - begin) / CLOCKS_PER_SEC;
  cout<<"\nthis is the time: "<<time_spent;
}
