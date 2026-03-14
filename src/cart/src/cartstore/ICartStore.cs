using System.Threading.Tasks;

namespace cart.cartstore;

public interface ICartStore
{
    void Initialize();

    Task AddItemAsync(string userId, string productId, int quantity);
    Task EmptyCartAsync(string userId);

    Task<Oteldemo.Cart> GetCartAsync(string userId);

    bool Ping();
}
