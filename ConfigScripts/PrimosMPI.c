
# include <cstdlib>
# include <iostream>
# include <iomanip>
# include <cmath>
# include <ctime>

# include "mpi.h"

using namespace std;

int main ( int argc, char *argv[] );
int prime_number ( int n, int id, int p );
void timestamp ( );

int main ( int argc, char *argv[] )

{
  int i;
  int id;
  int master = 0;
  int n;
  int n_factor;
  int n_hi;
  int n_lo;
  int p;
  int primes;
  int primes_part;
  double wtime;

  n_lo = 1;
  n_hi = 131072;
  n_factor = 2;
  MPI::Init ( argc, argv );
  p = MPI::COMM_WORLD.Get_size (  );
  id = MPI::COMM_WORLD.Get_rank ( );

  if ( id == master )
  {
    cout << "\n";
    cout << "'Cuenta primos\n";
    cout << "  C++/MPI version\n";
    cout << "\n";
    cout << "  Programa para contar cantidad de primos para un N dado.\n";
    cout << "  Corriendo en " << p << " procesos\n";
    cout << "\n";
    cout << "         N        S          Tiempo\n";
    cout << "\n";
  }

  n = n_lo;

  while ( n <= n_hi )
  {
    if ( id == master )
    {
      wtime = MPI::Wtime ( );
    }
    MPI::COMM_WORLD.Bcast ( &n, 1, MPI::INT, master );

    primes_part = prime_number ( n, id, p );

    MPI::COMM_WORLD.Reduce(&primes_part,&primes,1,MPI::INT, MPI::SUM,
      master );

    if ( id == master )
    {
      wtime = MPI::Wtime ( ) - wtime;

      cout << "  " << setw(8) << n
           << "  " << setw(8) << primes
           << "  " << setw(14) << wtime << "\n";
    }
    n = n * n_factor;
  }
  MPI::Finalize ( );

  if ( id == master )
  {
    cout << "\n";
    cout << "PRIME_MPI - Procesos maestro:\n";
    cout << "  Finalizacion del calculo normal.\n";
  }

  return 0;
}

int prime_number ( int n, int id, int p )

{
  int i;
  int j;
  int prime;
  int total;

  total = 0;

  for ( i = 2 + id; i <= n; i = i + p )
  {
    prime = 1;
    for ( j = 2; j < i; j++ )
    {
      if ( ( i % j ) == 0 )
      {
        prime = 0;
        break;
      }
    }
    total = total + prime;
  }
  return total;
}

void timestamp ( )

{
# define TIME_SIZE 40

  static char time_buffer[TIME_SIZE];
  const struct tm *tm;
  size_t len;
  time_t now;

  now = time ( NULL );
  tm = localtime ( &now );

  len= strftime(time_buffer,TIME_SIZE, "%d %B %Y %I:%M:%S %p", tm );

  cout << time_buffer << "\n";

  return;
# undef TIME_SIZE
}

